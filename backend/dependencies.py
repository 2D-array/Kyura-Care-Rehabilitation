import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

security = HTTPBearer(auto_error=False)


def get_supabase_client(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    client = create_client(url, key)

    if credentials:
        # Set the JWT so postgrest respects RLS
        client.postgrest.auth(credentials.credentials)

    return client


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication credentials missing")

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    client = create_client(url, key)

    try:
        user_response = client.auth.get_user(credentials.credentials)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user_response.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


def get_current_user_profile(
    user=Depends(get_current_user),
):
    """Fetch profile using admin client to avoid RLS issues."""
    from database import supabase_admin
    try:
        client_to_use = supabase_admin or create_client(
            os.environ.get("SUPABASE_URL"),
            os.environ.get("SUPABASE_KEY")
        )
        response = client_to_use.table("profiles").select("*").eq("id", user.id).execute()
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found. Please complete your registration."
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


def require_role(role: str):
    def role_checker(profile=Depends(get_current_user_profile)):
        if profile.get("role") != role:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Requires '{role}' role, but you have '{profile.get('role', 'unknown')}'."
            )
        return profile
    return role_checker

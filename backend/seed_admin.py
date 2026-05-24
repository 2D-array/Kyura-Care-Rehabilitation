import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not service_key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in environment variables.")
    sys.exit(1)

supabase_admin = create_client(url, service_key)


def seed_admin_profile(email: str):
    """Elevate the profile matching this email address to admin status in database."""
    print(f"Searching profile with email: {email}...")
    try:
        # Find profile matching email
        res = supabase_admin.table("profiles").select("*").eq("email", email).execute()
        if not res.data:
            print(f"Error: No profile user account exists matching the email '{email}'.")
            return
            
        profile = res.data[0]
        profile_id = profile["id"]
        current_role = profile.get("role")
        
        print(f"Profile found! ID: {profile_id}, Current Role: {current_role}")
        print("Toggling role to 'admin'...")
        
        update_res = supabase_admin.table("profiles").update(
            {"role": "admin"}
        ).eq("id", profile_id).execute()
        
        print("SUCCESS! Admin profile successfully elevated:")
        print(update_res.data[0])
        print("\nYou can now log in to the frontend dashboard and navigate to `/admin`!")
        
    except Exception as e:
        print(f"Exception during seeding script: {e}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_email = sys.argv[1].strip()
    else:
        target_email = input("Enter the user profile email address you wish to elevate to 'admin': ").strip()
        
    if not target_email:
        print("Error: Email address cannot be blank.")
        sys.exit(1)
        
    seed_admin_profile(target_email)

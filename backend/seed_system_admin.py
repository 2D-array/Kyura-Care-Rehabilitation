import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not service_key:
    print("Error: Missing credentials")
    exit(1)

supabase_admin = create_client(url, service_key)

ADMIN_EMAIL = "admin@cura.reb"
ADMIN_PASSWORD = "Admin6386"

try:
    # Check if user already exists in auth list
    print("Listing existing auth users...")
    users = supabase_admin.auth.admin.list_users()
    user_id = None
    for u in users:
        if u.email == ADMIN_EMAIL:
            user_id = u.id
            break

    if not user_id:
        print(f"Creating dedicated system admin account: {ADMIN_EMAIL}...")
        new_user = supabase_admin.auth.admin.create_user({
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": {
                "first_name": "System",
                "last_name": "Admin",
                "role": "admin"
            }
        })
        user_id = new_user.user.id
        print(f"Auth user created successfully! ID: {user_id}")
    else:
        print(f"System admin user already exists. Resetting credentials...")
        supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {
                "password": ADMIN_PASSWORD,
                "email_confirm": True
            }
        )
        print("Password updated successfully.")

    # 2. Elevate in database profiles table
    print("Updating profiles table role to 'admin'...")
    prof_res = supabase_admin.table("profiles").select("*").eq("id", user_id).execute()
    if prof_res.data:
        supabase_admin.table("profiles").update({
            "email": ADMIN_EMAIL,
            "role": "admin",
            "first_name": "System",
            "last_name": "Admin"
        }).eq("id", user_id).execute()
    else:
        supabase_admin.table("profiles").insert({
            "id": user_id,
            "email": ADMIN_EMAIL,
            "role": "admin",
            "first_name": "System",
            "last_name": "Admin"
        }).execute()
        
    print("\nSUCCESS!")
    print(f"Admin Username (Email): {ADMIN_EMAIL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print("\nDedicated isolated Admin credentials have been fully provisioned!")
except Exception as e:
    print(f"Error: {e}")

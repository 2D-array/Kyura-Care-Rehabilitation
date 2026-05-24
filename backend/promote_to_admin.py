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

TARGET_EMAIL = "dakshcdr@gmail.com"
NEW_PASSWORD = "CuraRebAdmin123!"

try:
    # 1. Find user in auth list
    print(f"Finding user '{TARGET_EMAIL}' in Supabase Auth...")
    users = supabase_admin.auth.admin.list_users()
    user_obj = None
    for u in users:
        if u.email == TARGET_EMAIL:
            user_obj = u
            break
            
    if not user_obj:
        print(f"Error: User '{TARGET_EMAIL}' not found in Supabase Auth.")
        exit(1)
        
    user_id = user_obj.id
    print(f"Found Auth User: {TARGET_EMAIL} | ID: {user_id}")

    # 2. Update auth password
    print(f"Resetting password to '{NEW_PASSWORD}'...")
    supabase_admin.auth.admin.update_user_by_id(
        user_id,
        {
            "password": NEW_PASSWORD,
            "email_confirm": True
        }
    )
    print("Password reset successfully.")

    # 3. Promote profile role to admin in profiles table
    print(f"Checking profile in profiles table...")
    prof_res = supabase_admin.table("profiles").select("*").eq("id", user_id).execute()
    
    if prof_res.data:
        print(f"Updating existing profile to role 'admin'...")
        supabase_admin.table("profiles").update({"role": "admin"}).eq("id", user_id).execute()
    else:
        print(f"Inserting new profile row with role 'admin'...")
        supabase_admin.table("profiles").insert({
            "id": user_id,
            "email": TARGET_EMAIL,
            "role": "admin",
            "first_name": "Daksh",
            "last_name": "Jain"
        }).execute()
        
    print("\nSUCCESS!")
    print(f"Admin account activated: {TARGET_EMAIL}")
    print(f"Password reset to: {NEW_PASSWORD}")
    print("\nYou can now log in to the admin console!")
    
except Exception as e:
    print(f"Error: {e}")

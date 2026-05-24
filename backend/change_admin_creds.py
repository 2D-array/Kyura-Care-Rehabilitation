import sys
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not service_key:
    print("Error: Missing credentials")
    sys.exit(1)

supabase_admin = create_client(url, service_key)

ADMIN_UUID = "6f449aa7-c153-4dc1-8224-432d43fede7e"

def update_credentials(new_email: str, new_password: str):
    print(f"Updating credentials for admin profile ID {ADMIN_UUID}...")
    try:
        # 1. Update auth credentials
        print(f"Updating Supabase Auth: setting email to '{new_email}' and password to '{new_password}'...")
        auth_res = supabase_admin.auth.admin.update_user_by_id(
            ADMIN_UUID,
            {
                "email": new_email,
                "password": new_password,
                "email_confirm": True
            }
        )
        print("Auth credentials updated successfully in Supabase Auth.")

        # 2. Update profiles table
        print(f"Updating 'profiles' table to match new email...")
        profile_res = supabase_admin.table("profiles").update(
            {"email": new_email}
        ).eq("id", ADMIN_UUID).execute()
        
        print("\nSUCCESS!")
        print(f"Email changed to: {new_email}")
        print(f"Temporary Password set to: {new_password}")
        print("\nYou can now log in using these new credentials!")
    except Exception as e:
        print(f"Error during credential update: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python change_admin_creds.py <new_email> <new_password>")
        sys.exit(1)
        
    email = sys.argv[1].strip()
    password = sys.argv[2].strip()
    
    if not email or not password:
        print("Error: Email and Password cannot be blank.")
        sys.exit(1)
        
    update_credentials(email, password)

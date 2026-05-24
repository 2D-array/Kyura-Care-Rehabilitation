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

try:
    res = supabase_admin.table("profiles").select("*").eq("role", "admin").execute()
    print("--- ADMIN PROFILES ---")
    for profile in res.data:
        print(f"ID: {profile['id']} | Email: {profile.get('email')} | Name: {profile.get('first_name')} {profile.get('last_name')}")
except Exception as e:
    print(f"Error: {e}")

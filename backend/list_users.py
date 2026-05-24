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
    users_res = supabase_admin.auth.admin.list_users()
    print("--- USERS LIST ---")
    for u in users_res:
        print(f"ID: {u.id} | Email: {u.email} | Created: {u.created_at}")
except Exception as e:
    print(f"Error: {e}")

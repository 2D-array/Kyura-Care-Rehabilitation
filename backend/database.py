import os
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
service_role_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("Supabase credentials not found in environment variables.")

# Create the standard client for regular operations
supabase: Client = create_client(url, key)

# Create an admin client for backend operations that need to bypass RLS (if needed)
supabase_admin: Client = create_client(url, service_role_key) if service_role_key else None

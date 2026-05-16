# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from routers import doctors, patients, appointments, subscriptions, auth

app = FastAPI(
    title="Physiotherapy Recovery Marketplace API",
    description="API for the post-accident rehabilitation and long-term recovery marketplace.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(subscriptions.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Physiotherapy Recovery Marketplace API"}

@app.get("/health")
def health_check():
    # Simple check to see if Supabase client is initialized
    return {"status": "ok", "supabase_configured": supabase is not None}

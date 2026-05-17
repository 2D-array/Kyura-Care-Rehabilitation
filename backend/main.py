import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from routers import doctors, patients, appointments, subscriptions, auth, reviews

app = FastAPI(
    title="Physiotherapy Recovery Marketplace API",
    description="API for the post-accident rehabilitation and long-term recovery marketplace.",
    version="1.0.0"
)

allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(subscriptions.router)
app.include_router(auth.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Physiotherapy Recovery Marketplace API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "supabase_configured": supabase is not None}

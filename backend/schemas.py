from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DoctorOnboard(BaseModel):
    specialty: str
    license_number: str
    bio: Optional[str] = None
    consultation_fee: float = 0.0

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: datetime
    session_type: str # online, in-clinic, at-home

class AppointmentStatusUpdate(BaseModel):
    status: str

class SubscriptionCreate(BaseModel):
    tier: str # weekly, monthly, yearly

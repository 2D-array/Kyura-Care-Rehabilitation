from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class SessionType(str, Enum):
    online = "online"
    in_clinic = "in-clinic"
    at_home = "at-home"

class AppointmentStatus(str, Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no-show"

class SubscriptionTier(str, Enum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"

class RoleType(str, Enum):
    patient = "patient"
    doctor = "doctor"

class DoctorOnboard(BaseModel):
    specialty: str
    license_number: str
    bio: Optional[str] = None
    consultation_fee: float = 0.0

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: datetime
    session_type: SessionType

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

class SubscriptionCreate(BaseModel):
    tier: SubscriptionTier

class PatientProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    primary_injury: Optional[str] = None
    medical_history: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_id: Optional[str] = None
    # Structured medical record fields
    age: Optional[int] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    past_surgeries: Optional[str] = None
    chronic_conditions: Optional[str] = None

class DoctorProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    specialty: Optional[str] = None
    education_details: Optional[str] = None
    years_of_experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    available_hours: Optional[str] = None
    degree_proofs_link: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    languages_spoken: Optional[str] = None
    # Qualification proof fields
    registration_number: Optional[str] = None
    qualification_proof_url: Optional[str] = None
    specialization_certificates: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: Optional[datetime] = None

class AppointmentResponse(BaseModel):
    id: str
    appointment_date: datetime
    status: str
    session_type: str

class SyncProfileRequest(BaseModel):
    role: RoleType
    first_name: str
    last_name: str
    license_number: Optional[str] = None

class ReviewCreate(BaseModel):
    doctor_id: str
    rating: int
    comment: Optional[str] = None

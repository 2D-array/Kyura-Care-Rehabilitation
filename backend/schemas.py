from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time
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
    appointment_id: Optional[str] = None


# ── Phase 1 new schemas ──

class AvailabilitySlot(BaseModel):
    id: Optional[str] = None
    doctor_id: str
    day_of_week: int  # 0=Sunday, 6=Saturday
    start_time: str   # "09:00"
    end_time: str      # "17:00"
    session_types: List[str] = ["online", "in-clinic", "at-home"]
    is_active: bool = True


class AvailabilityCreate(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    session_types: List[str] = ["online", "in-clinic", "at-home"]


class ReviewPublic(BaseModel):
    id: str
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    patient_first_name: Optional[str] = None
    patient_last_initial: Optional[str] = None


class DoctorPublicProfile(BaseModel):
    id: str
    specialty: Optional[str] = None
    bio: Optional[str] = None
    consultation_fee: Optional[float] = None
    years_of_experience: Optional[int] = None
    education_details: Optional[str] = None
    languages_spoken: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    is_verified: Optional[bool] = False
    is_online: Optional[bool] = False
    available_session_types: Optional[List[str]] = []
    available_days: Optional[str] = None
    available_hours: Optional[str] = None
    average_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


class MembershipAdminUpdate(BaseModel):
    tier: str
    action: str  # "grant" | "revoke" | "upgrade"


class RescheduleAdminRequest(BaseModel):
    new_date: str


class AnnouncementRequest(BaseModel):
    target: str  # "all" | "patients" | "doctors"
    title: str
    content: str


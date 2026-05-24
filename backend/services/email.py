"""
Email service using Resend HTTP REST API for CuraReb.
Supports automatic fallback stubs when RESEND_API_KEY is not configured in .env.
"""
import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")


def send_via_resend(to_email: str, subject: str, html_content: str) -> bool:
    """Send email utilizing the official Resend HTTP REST API without new external packages."""
    if not RESEND_API_KEY:
        return False
    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "from": "CuraReb <onboarding@resend.dev>",
            "to": to_email,
            "subject": subject,
            "html": html_content
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            logger.info(f"Resend email dispatched successfully to {to_email}: {res_body}")
            return True
    except urllib.error.HTTPError as he:
        err_body = he.read().decode("utf-8")
        logger.error(f"Resend HTTPError sending email: {he.code} - {err_body}")
    except Exception as e:
        logger.error(f"Failed to send email via Resend: {e}")
    return False


def send_appointment_confirmation(
    patient_email: str,
    patient_name: str,
    doctor_name: str,
    appointment_date: str,
    session_type: str,
):
    """Send appointment confirmation email to patient."""
    subject = f"Appointment Confirmed with Dr. {doctor_name}"
    html = f"<p>Hi {patient_name}, your {session_type} appointment with Dr. {doctor_name} on {appointment_date} has been confirmed.</p>"

    if RESEND_API_KEY:
        dispatched = send_via_resend(patient_email, subject, html)
        if dispatched:
            return

    # Fallback log stub
    logger.info(
        f"[EMAIL STUB] Appointment confirmation → "
        f"To: {patient_email}, "
        f"Patient: {patient_name}, "
        f"Doctor: Dr. {doctor_name}, "
        f"Date: {appointment_date}, "
        f"Type: {session_type}"
    )


def send_appointment_status_update(
    patient_email: str,
    patient_name: str,
    doctor_name: str,
    appointment_date: str,
    new_status: str,
):
    """Send status update email when appointment status changes."""
    subject = f"Appointment Status Updated to {new_status}"
    html = f"<p>Hi {patient_name}, your appointment with Dr. {doctor_name} on {appointment_date} has been updated to: <strong>{new_status}</strong>.</p>"

    if RESEND_API_KEY:
        dispatched = send_via_resend(patient_email, subject, html)
        if dispatched:
            return

    # Fallback log stub
    logger.info(
        f"[EMAIL STUB] Status update → "
        f"To: {patient_email}, "
        f"Status: {new_status}, "
        f"Doctor: Dr. {doctor_name}, "
        f"Date: {appointment_date}"
    )


def send_otp_email(email: str, otp: str):
    """Send OTP recovery code to the user's email."""
    subject = f"CuraReb - Reset Password OTP: {otp}"
    html = f"""
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 16px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">CuraReb Password Reset</h2>
        <p style="font-size: 14px; margin-bottom: 24px;">You requested to reset your password. Use the following secure OTP code to complete the request:</p>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #0f172a; margin-bottom: 24px;">
            {otp}
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 24px;">This code is valid for 10 minutes. If you did not request this reset, please ignore this email.</p>
    </div>
    """

    if RESEND_API_KEY:
        dispatched = send_via_resend(email, subject, html)
        if dispatched:
            return

    # Fallback log stub
    logger.info(
        f"\n"
        f"==================================================\n"
        f"[EMAIL STUB] PASSWORD RESET OTP CODE\n"
        f"To: {email}\n"
        f"OTP Code: {otp}\n"
        f"Expires In: 10 minutes\n"
        f"==================================================\n"
    )

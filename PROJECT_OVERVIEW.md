# CuraReb - Physiotherapy Recovery Marketplace

CuraReb is a premium, full-stack web application designed as a marketplace for post-accident rehabilitation and long-term care. It connects patients with specialized physiotherapists (doctors) through a secure, high-fidelity platform.

The system is built with a decoupled architecture, featuring a modern Next.js frontend, a robust FastAPI backend, and Supabase for unified authentication and database management.

---

## 🏗️ Architecture Overview

The application follows a standard client-server architecture with a Backend-as-a-Service (BaaS) integration for auth and persistent data:

1. **Frontend (Client)**: A Next.js application responsible for the UI, routing, state management, and Server-Side Rendering (SSR).
2. **Backend (API)**: A Python FastAPI service that handles business logic, specialized data processing, and profile synchronization.
3. **Database & Auth (BaaS)**: Supabase acts as the primary data store (PostgreSQL) and identity provider.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS for utility-first styling.
- **UI Components**: Shadcn UI (Radix UI primitives) customized for a premium "Apple-level" medical aesthetic.
- **Animations**: Framer Motion for dynamic micro-interactions, smooth page transitions, and hover effects.
- **Icons**: Lucide React.
- **State & Auth Binding**: `@supabase/ssr` and `@supabase/supabase-js` for managing sessions securely between the server and the browser.

### Backend
- **Framework**: FastAPI (High-performance, async Python web framework)
- **Language**: Python 3.11+
- **Data Validation**: Pydantic (for schemas and request/response validation).
- **Database Client**: `supabase-py` to interface with the Supabase PostgreSQL database.
- **Environment Management**: `python-dotenv` for managing secrets.
- **Server**: Uvicorn (ASGI web server).

### Database & Infrastructure
- **Provider**: Supabase
- **Database Engine**: PostgreSQL
- **Authentication**: Supabase Auth (Email/Password, JWT-based session management).
- **Row Level Security (RLS)**: Enforced at the database level to secure patient and doctor data.

---

## 🚀 Key Features

### 1. Unified Identity & Authentication
- Secure registration and login flow for both **Patients** and **Doctors**.
- Role-based conditional logic: Doctors are required to provide a Medical License Number during sign-up.
- Secure session handling using Next.js Middleware and Supabase SSR to protect protected routes like `/dashboard`.
- FastAPI backend synchronization endpoint (`/api/v1/auth/sync-profile`) that ties the Supabase Auth user to a dedicated database profile row upon successful registration.

### 2. Premium User Interface
- A highly aesthetic, modern landing page with glassmorphism, smooth gradients, and noise textures.
- Dark mode support built-in via `next-themes`.
- Responsive layouts ensuring functionality across mobile and desktop devices.
- Interactive dashboards tailored to the user's role.

### 3. Core Business Logic (Backend Routers)
The FastAPI backend is divided into logical routers to handle specific domains:
- **Auth (`/auth`)**: Handles profile synchronization and role assignment when users first sign up.
- **Doctors (`/doctors`)**: Endpoints for searching, listing, and retrieving specialized physiotherapist profiles.
- **Patients (`/patients`)**: Endpoints for managing patient-specific data, medical history, and recovery progress.
- **Appointments (`/appointments`)**: Booking engine for scheduling online consultations, in-clinic physical therapy, and at-home care.
- **Subscriptions (`/subscriptions`)**: Management of long-term care plans and recurring recovery services.

---

## 📂 Project Structure

```text
CuraReb/
├── backend/                  # FastAPI Application
│   ├── main.py               # Application entry point & router inclusion
│   ├── database.py           # Supabase client initialization
│   ├── dependencies.py       # FastAPI dependencies (e.g., auth verification)
│   ├── schemas.py            # Pydantic models for data validation
│   ├── requirements.txt      # Python dependencies
│   └── routers/              # API Route modules
│       ├── appointments.py
│       ├── auth.py
│       ├── doctors.py
│       ├── patients.py
│       └── subscriptions.py
│
├── frontend/                 # Next.js Application
│   ├── next.config.ts        # Next.js configuration
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.ts    # Tailwind CSS styling variables
│   └── src/
│       ├── app/              # Next.js App Router (Pages & Layouts)
│       │   ├── auth/         # Login, Signup, and Auth Callback routes
│       │   ├── dashboard/    # Protected user portals & profile management
│       │   ├── doctors/      # Public doctor discovery pages
│       │   ├── page.tsx      # Premium Landing Page
│       │   └── layout.tsx    # Root layout & providers
│       ├── components/       # Reusable React components (Navbar, Sidebar, UI)
│       ├── lib/              # Utility functions (e.g., tailwind class merger)
│       └── utils/            # Supabase SSR clients (browser, server, middleware)
```

---

## 🔒 Security Best Practices Implemented

1. **JWT Verification**: The backend verifies Supabase access tokens on protected routes to ensure data integrity.
2. **Server-Side Auth Checks**: The frontend uses Next.js middleware to verify session cookies before rendering protected dashboard pages, preventing unauthorized access.
3. **CORS Configuration**: The FastAPI backend is configured to safely accept cross-origin requests exclusively from the frontend domain.
4. **Environment Variables**: Sensitive keys (Supabase URLs, Anon Keys, and Service Role Keys) are strictly managed via `.env` files and never hardcoded.

---

## 🏃 How to Run Locally

### 1. Start the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*The API will be available at `http://127.0.0.1:8000`*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The web app will be available at `http://localhost:3000`*

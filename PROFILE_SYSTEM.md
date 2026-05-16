# CuraReb Profile System Documentation

## Overview
Complete, production-ready profile management system for both patients and doctors with premium glassmorphism UI.

## Features Implemented

### 1. Backend API Enhancements

#### Updated Schemas (`backend/schemas.py`)
- **PatientProfileUpdate**: Comprehensive schema with all patient fields
  - first_name, last_name, phone_number, emergency_contact
  - date_of_birth, address, primary_injury, medical_history
  - documents_link

- **DoctorProfileUpdate**: Comprehensive schema with all doctor fields
  - first_name, last_name, bio, specialty, education_details
  - years_of_experience, consultation_fee
  - available_days, available_hours, degree_proofs_link

- **ProfileResponse**: Base profile response schema
- **AppointmentResponse**: Appointment data schema

#### Patient Endpoints (`backend/routers/patients.py`)
- `GET /api/v1/patients/me` - Get complete patient profile with merged data
- `PUT /api/v1/patients/me` - Update patient profile (handles both profiles and patients tables)
- `GET /api/v1/patients/me/appointments` - Get patient appointment history
- `GET /api/v1/patients/me/documents` - Placeholder for document management

#### Doctor Endpoints (`backend/routers/doctors.py`)
- `GET /api/v1/doctors/me` - Get complete doctor profile with merged data
- `PUT /api/v1/doctors/me` - Update doctor profile (handles both profiles and doctors tables)
- `GET /api/v1/doctors/me/appointments` - Get doctor appointment history
- `GET /api/v1/doctors/me/reviews` - Placeholder for reviews system
- `PUT /api/v1/doctors/me/availability` - Update doctor availability

### 2. Frontend Components

#### Profile Hook (`frontend/src/hooks/useProfile.ts`)
Custom React hook for profile management:
- `profile` - Current user profile data
- `loading` - Loading state
- `error` - Error state
- `updateProfile(data)` - Update profile mutation
- `refetch()` - Manually refetch profile

**Features:**
- Automatic role detection (patient vs doctor)
- Session management with Supabase
- Optimistic updates
- Error handling

**Usage:**
```typescript
import { useProfile } from '@/hooks/useProfile'

function MyComponent() {
  const { profile, loading, updateProfile } = useProfile()
  
  const handleSave = async () => {
    await updateProfile({ first_name: 'John', last_name: 'Doe' })
  }
}
```

#### Profile Page (`frontend/src/app/dashboard/profile/page.tsx`)
Comprehensive profile page with tabbed interface:

**Tabs:**
1. **Profile Tab**
   - Patient Fields: name, phone, DOB, emergency contact, address, injury type, medical history
   - Doctor Fields: name, specialty, bio, education, experience, fees, availability
   - Real-time form updates
   - Save functionality with toast notifications

2. **Security Tab**
   - Password change form
   - Current/new password fields
   - Secure password update

3. **Settings Tab**
   - Email notifications toggle
   - SMS reminders toggle
   - Marketing preferences

4. **History Tab**
   - Appointment history preview
   - Status badges (Completed, Upcoming)
   - Quick navigation to full history

**UI Features:**
- Premium glassmorphism design
- Gradient avatar with initials
- Avatar upload button (placeholder)
- Verification badge for doctors
- Membership tier display for patients
- Responsive layout (mobile-first)
- Dark mode support
- Skeleton loaders
- Toast notifications

#### Navbar (`frontend/src/components/navbar.tsx`)
Updated navbar with profile integration:

**Features:**
- Profile avatar with user initials
- Gradient background (indigo to purple)
- Dropdown menu with:
  - User name and role display
  - Dashboard link
  - View Profile link
  - Settings link
  - Logout button
- Automatic session detection
- Fallback to Login/Register buttons when logged out

**Dropdown Menu Items:**
- Dashboard (with LayoutDashboard icon)
- View Profile (with User icon)
- Settings (with Settings icon)
- Log out (with LogOut icon, red text)

### 3. UI Components Used

**Shadcn Components:**
- Avatar & AvatarFallback
- Badge
- Button
- Card
- Input
- Textarea
- Tabs (TabsList, TabsTrigger, TabsContent)
- Skeleton
- DropdownMenu (DropdownMenuTrigger, DropdownMenuContent, etc.)
- Sonner (Toast notifications)

**Icons (Lucide React):**
- User, Mail, ShieldCheck, Camera
- Calendar, FileText, Settings, History
- LayoutDashboard, LogOut

### 4. Design System

**Colors:**
- Primary: Indigo (600/500)
- Secondary: Purple (600/500)
- Success: Emerald (500/600)
- Warning: Amber (500/600)
- Danger: Red (600/500)

**Border Radius:**
- Small elements: 1rem (rounded-xl)
- Cards: 2rem (rounded-[2rem])
- Buttons: 1.5rem (rounded-2xl)
- Avatar: 2rem (rounded-[2rem])

**Effects:**
- Glassmorphism: `bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl`
- Shadows: `shadow-lg`, `shadow-xl`, `shadow-2xl`
- Borders: `border border-slate-200/60 dark:border-white/5`

**Typography:**
- Headings: `font-black` (900 weight)
- Labels: `font-bold` (700 weight)
- Body: `font-medium` (500 weight)

## API Integration

### Authentication
All API calls require Bearer token authentication:
```typescript
const { data: { session } } = await supabase.auth.getSession()
const headers = { Authorization: `Bearer ${session.access_token}` }
```

### Update Profile Example
```typescript
// Patient update
await fetch(`${API_URL}/api/v1/patients/me`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '+1234567890',
    primary_injury: 'Lower Back'
  })
})

// Doctor update
await fetch(`${API_URL}/api/v1/doctors/me`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Experienced neurological specialist...',
    consultation_fee: 150,
    available_days: 'Mon, Wed, Fri'
  })
})
```

## Database Schema Requirements

### Profiles Table
```sql
- id (uuid, primary key)
- email (text)
- role (text: 'patient' | 'doctor')
- first_name (text, nullable)
- last_name (text, nullable)
- created_at (timestamp)
```

### Patients Table
```sql
- id (uuid, foreign key to profiles.id)
- phone_number (text, nullable)
- emergency_contact (text, nullable)
- date_of_birth (text, nullable)
- address (text, nullable)
- primary_injury (text, nullable)
- medical_history (text, nullable)
- documents_link (text, nullable)
```

### Doctors Table
```sql
- id (uuid, foreign key to profiles.id)
- bio (text, nullable)
- specialty (text, nullable)
- education_details (text, nullable)
- years_of_experience (integer, nullable)
- consultation_fee (float, nullable)
- available_days (text, nullable)
- available_hours (text, nullable)
- license_number (text)
- is_verified (boolean, default false)
- degree_proofs_link (text, nullable)
```

## Testing

### Backend Testing
```bash
cd backend
python -m uvicorn main:app --reload

# Test endpoints
curl -X GET http://localhost:8000/api/v1/patients/me \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X PUT http://localhost:8000/api/v1/patients/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe"}'
```

### Frontend Testing
```bash
cd frontend
npm run dev

# Navigate to:
# - http://localhost:3000/dashboard/profile
# - Check navbar avatar dropdown
# - Test profile updates
# - Verify toast notifications
```

## Future Enhancements

### Planned Features
1. **Avatar Upload**
   - Image upload to Supabase Storage
   - Image cropping/resizing
   - Avatar preview

2. **Document Management**
   - Upload medical documents (patients)
   - Upload degree proofs (doctors)
   - Document viewer
   - Download functionality

3. **Reviews System**
   - Patient reviews for doctors
   - Star ratings
   - Review moderation

4. **Advanced Availability**
   - Calendar integration
   - Time slot management
   - Booking conflicts prevention

5. **Notifications**
   - Email notification settings
   - SMS reminder preferences
   - Push notifications

6. **Security Enhancements**
   - Two-factor authentication
   - Password strength meter
   - Login history
   - Active sessions management

## Troubleshooting

### Common Issues

**Profile not loading:**
- Check if user is authenticated
- Verify API_URL in .env.local
- Check browser console for errors
- Verify backend is running

**Update not saving:**
- Check network tab for API errors
- Verify token is valid
- Check backend logs
- Ensure fields match schema

**Avatar not showing:**
- Check if profile data is loaded
- Verify initials logic
- Check CSS classes

**Dropdown not working:**
- Ensure dropdown-menu component is installed
- Check z-index conflicts
- Verify click handlers

## Performance Considerations

1. **Profile Hook Caching**
   - Profile data is cached in state
   - Only refetches on mount or manual refetch
   - Consider adding React Query for better caching

2. **Optimistic Updates**
   - Form updates are local until save
   - Only changed fields are sent to API
   - Reduces unnecessary API calls

3. **Lazy Loading**
   - Appointment history loads on tab switch
   - Documents load on demand
   - Reduces initial page load

## Security Notes

1. **Authentication**
   - All endpoints require valid JWT token
   - Tokens are validated on backend
   - RLS policies enforce data access

2. **Data Validation**
   - Pydantic schemas validate all inputs
   - SQL injection prevention via Supabase client
   - XSS prevention via React escaping

3. **Privacy**
   - Users can only access their own data
   - Role-based access control
   - Sensitive data (passwords) never exposed

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Backend deployed and accessible
- [ ] Frontend built and deployed
- [ ] CORS configured correctly
- [ ] SSL/TLS enabled
- [ ] Error monitoring setup
- [ ] Analytics configured
- [ ] Backup strategy in place

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Check browser console
4. Verify database schema
5. Test API endpoints directly

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** Production Ready ✅

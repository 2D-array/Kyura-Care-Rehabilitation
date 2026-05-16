# Profile System Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- Supabase project configured
- User authenticated

### 1. Start Backend
```bash
cd backend
python -m uvicorn main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Profile Page
Navigate to: `http://localhost:3000/dashboard/profile`

## 📋 Features Overview

### For Patients
✅ Edit personal information (name, phone, DOB, address)  
✅ Add emergency contact  
✅ Record primary injury type  
✅ Document medical history  
✅ View appointment history  
✅ Manage membership tier  

### For Doctors
✅ Edit professional profile (name, specialty, bio)  
✅ Update education and credentials  
✅ Set consultation fees  
✅ Configure availability (days & hours)  
✅ View verification status  
✅ Track patient appointments  

## 🎨 UI Components

### Profile Page Tabs
1. **Profile** - Edit personal/professional information
2. **Security** - Change password and security settings
3. **Settings** - Notification preferences
4. **History** - Appointment history and documents

### Navbar Avatar
- Click avatar in top-right corner
- Dropdown menu with:
  - Dashboard link
  - View Profile link
  - Settings link
  - Logout button

## 🔧 API Endpoints

### Patient Endpoints
```
GET    /api/v1/patients/me              # Get profile
PUT    /api/v1/patients/me              # Update profile
GET    /api/v1/patients/me/appointments # Get appointments
GET    /api/v1/patients/me/documents    # Get documents
```

### Doctor Endpoints
```
GET    /api/v1/doctors/me               # Get profile
PUT    /api/v1/doctors/me               # Update profile
GET    /api/v1/doctors/me/appointments  # Get appointments
GET    /api/v1/doctors/me/reviews       # Get reviews
PUT    /api/v1/doctors/me/availability  # Update availability
```

## 💡 Usage Examples

### Update Patient Profile
```typescript
import { useProfile } from '@/hooks/useProfile'

function MyComponent() {
  const { updateProfile } = useProfile()
  
  const handleSave = async () => {
    await updateProfile({
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+1234567890',
      primary_injury: 'Lower Back Pain'
    })
  }
}
```

### Update Doctor Profile
```typescript
const handleSave = async () => {
  await updateProfile({
    bio: 'Experienced neurological rehabilitation specialist...',
    specialty: 'Neurological Rehabilitation',
    consultation_fee: 150,
    available_days: 'Mon, Wed, Fri',
    available_hours: '9:00 AM - 5:00 PM'
  })
}
```

## 🎯 Key Features

### Real-time Updates
- Form changes tracked locally
- Only modified fields sent to API
- Toast notifications on success/error

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly controls

### Dark Mode
- Full dark mode support
- Automatic theme detection
- Smooth transitions

### Loading States
- Skeleton loaders on initial load
- Button loading states during save
- Graceful error handling

## 🔐 Security

### Authentication
- All API calls require Bearer token
- Automatic session management
- Secure token storage

### Data Privacy
- Users can only access their own data
- Role-based access control
- RLS policies enforced

## 🐛 Troubleshooting

### Profile Not Loading
1. Check if user is logged in
2. Verify API_URL in `.env.local`
3. Check browser console for errors
4. Ensure backend is running

### Updates Not Saving
1. Check network tab for API errors
2. Verify token is valid
3. Check backend logs
4. Ensure fields match schema

### Avatar Not Showing
1. Check if profile data loaded
2. Verify initials logic
3. Clear browser cache

## 📱 Testing Checklist

- [ ] Login as patient
- [ ] Navigate to profile page
- [ ] Update personal information
- [ ] Save changes successfully
- [ ] Verify toast notification
- [ ] Check navbar avatar shows initials
- [ ] Test dropdown menu
- [ ] Switch between tabs
- [ ] Login as doctor
- [ ] Update professional profile
- [ ] Test availability settings
- [ ] Verify verification badge
- [ ] Test dark mode toggle
- [ ] Test mobile responsiveness

## 🎨 Design Tokens

### Colors
- Primary: `indigo-600`
- Secondary: `purple-600`
- Success: `emerald-500`
- Warning: `amber-500`
- Danger: `red-600`

### Border Radius
- Small: `rounded-xl` (1rem)
- Medium: `rounded-2xl` (1.5rem)
- Large: `rounded-[2rem]` (2rem)

### Shadows
- Small: `shadow-lg`
- Medium: `shadow-xl`
- Large: `shadow-2xl`

## 📚 Additional Resources

- [Full Documentation](./PROFILE_SYSTEM.md)
- [API Reference](./backend/README.md)
- [Component Library](./frontend/src/components/ui/)

## 🆘 Support

If you encounter issues:
1. Check the full documentation
2. Review backend logs
3. Inspect browser console
4. Test API endpoints with curl/Postman
5. Verify database schema

---

**Ready to use!** 🎉  
Navigate to `/dashboard/profile` to get started.

# Profile System Demo Guide

## 🎬 Demo Walkthrough

### Step 1: Login
1. Navigate to `http://localhost:3000/auth/login`
2. Login with patient or doctor credentials
3. Notice the navbar now shows your avatar instead of Login/Register buttons

### Step 2: Navbar Avatar
1. Look at the top-right corner of the navbar
2. You'll see a circular avatar with your initials
3. The avatar has a gradient background (indigo to purple)
4. Click on the avatar to open the dropdown menu

### Step 3: Dropdown Menu
The dropdown shows:
- **Your Name** (e.g., "John Doe")
- **Your Role** (e.g., "patient" or "doctor")
- **Dashboard** - Navigate to main dashboard
- **View Profile** - Go to profile page
- **Settings** - Quick access to settings
- **Log out** - Sign out (red text)

### Step 4: Navigate to Profile
1. Click "View Profile" from dropdown
2. Or navigate directly to `/dashboard/profile`
3. Page loads with skeleton loaders
4. Profile data appears after loading

## 👤 Patient Profile Demo

### Profile Header
- Large gradient avatar with initials
- Full name displayed
- "patient Account" label
- Camera icon for avatar upload (placeholder)

### Profile Tab
**Personal Information Card:**
- First Name field (editable)
- Last Name field (editable)
- Phone Number field
- Date of Birth field (date picker)
- Emergency Contact field
- Address field
- Primary Injury Type field
- Medical History (textarea)
- Blue "Save Changes" button

**Account Info Sidebar:**
- Email address (read-only)
- Membership Tier display
- "Free Plan" badge
- "Upgrade to Premium" link

### Security Tab
- Current Password field
- New Password field
- Confirm New Password field
- "Update Password" button

### Settings Tab
- Email Notifications toggle
- SMS Reminders toggle
- Marketing Emails toggle

### History Tab
- Appointment history cards
- Doctor name and specialty
- Appointment date
- Status badges (Completed, Upcoming)

## 👨‍⚕️ Doctor Profile Demo

### Profile Header
- Large gradient avatar with initials
- Full name displayed
- "doctor Account" label
- **Verification Badge** (if verified)
- Camera icon for avatar upload (placeholder)

### Profile Tab
**Professional Profile Card:**
- First Name field (editable)
- Last Name field (editable)
- Specialty field
- Professional Bio (textarea)
- Education & Credentials (textarea)
- Years of Experience field (number)
- Consultation Fee field (number)
- Available Days field
- Available Hours field
- Blue "Save Changes" button

**Account Info Sidebar:**
- Email address (read-only)
- Medical License number (read-only)

**Verification Status Card:**
- Verification badge (green if verified, amber if pending)
- Status message

### Security Tab
Same as patient

### Settings Tab
Same as patient

### History Tab
- Recent appointments with patients
- Patient names
- Appointment types
- Status badges

## 🎨 Visual Features

### Glassmorphism Design
- Semi-transparent white/dark backgrounds
- Backdrop blur effect
- Subtle borders
- Elevated shadows

### Color Scheme
- **Primary:** Indigo (buttons, links, accents)
- **Secondary:** Purple (gradients)
- **Success:** Emerald (verified badges)
- **Warning:** Amber (pending badges)
- **Danger:** Red (logout button)

### Typography
- **Headings:** Extra bold (font-black)
- **Labels:** Bold (font-bold)
- **Body:** Medium (font-medium)
- **Monospace:** License numbers

### Spacing
- Large padding on cards (p-6, p-8)
- Consistent gaps (gap-4, gap-6)
- Rounded corners (2rem for cards)

### Animations
- Smooth transitions on hover
- Button scale effects
- Dropdown slide animations
- Toast notifications slide in

## 🎯 Interactive Elements

### Buttons
- **Primary:** Blue background, white text, shadow
- **Hover:** Darker blue, larger shadow
- **Disabled:** Gray, no hover effect
- **Loading:** "Saving..." text

### Input Fields
- Rounded corners (rounded-2xl)
- White/dark background
- Border on focus
- Placeholder text

### Badges
- Rounded corners
- Colored backgrounds
- Icon + text
- Different variants (success, warning, default)

### Tabs
- Horizontal tab list
- Active tab highlighted
- Smooth transitions
- Icon + text labels

## 📱 Responsive Behavior

### Desktop (1024px+)
- Two-column layout (main + sidebar)
- Full navbar with all links
- Large avatar (28x28)
- Spacious padding

### Tablet (768px - 1023px)
- Two-column layout maintained
- Slightly reduced padding
- Medium avatar (24x24)
- Compact spacing

### Mobile (< 768px)
- Single column layout
- Stacked cards
- Smaller avatar (20x20)
- Touch-friendly buttons
- Hamburger menu (if implemented)

## 🌙 Dark Mode

### Light Mode
- White backgrounds
- Dark text
- Light borders
- Subtle shadows

### Dark Mode
- Dark slate backgrounds
- Light text
- Subtle white borders
- Elevated shadows
- Gradient overlay on body

### Toggle
- Moon/Sun icon in navbar
- Instant theme switch
- Persisted preference
- Smooth transitions

## 🔔 Toast Notifications

### Success Toast
- Green checkmark icon
- "Profile updated successfully!"
- Appears top-center
- Auto-dismisses after 3s

### Error Toast
- Red X icon
- Error message
- Appears top-center
- Auto-dismisses after 5s

## 🎭 User Flows

### Patient Update Flow
1. Login as patient
2. Click avatar → View Profile
3. Edit fields in Profile tab
4. Click "Save Changes"
5. See loading state on button
6. Toast notification appears
7. Form resets to saved state

### Doctor Update Flow
1. Login as doctor
2. Click avatar → View Profile
3. See verification badge
4. Edit professional fields
5. Update availability
6. Click "Save Changes"
7. Toast notification appears
8. Changes reflected immediately

### Password Change Flow
1. Navigate to Security tab
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "Update Password"
6. Toast notification
7. Redirected to login (optional)

## 🎪 Demo Script

### For Stakeholders
```
"Let me show you the new profile system. 

First, notice the avatar in the top-right corner - it shows the user's initials with a beautiful gradient. When I click it, we get a dropdown with quick access to the dashboard, profile, settings, and logout.

Now let's go to the profile page. You can see we have a comprehensive tabbed interface. In the Profile tab, patients can update all their personal information - name, phone, emergency contact, medical history. For doctors, they can update their professional bio, specialty, fees, and availability.

The Security tab lets users change their password. Settings has notification preferences. And History shows their appointment history.

Notice the premium glassmorphism design - semi-transparent cards with blur effects. It works beautifully in both light and dark mode. Watch this... [toggle dark mode]

When I update a field and save, you get instant feedback with a toast notification. The form only sends changed fields to the API, making it efficient.

For doctors, we also show their verification status with a badge. This builds trust with patients.

Everything is fully responsive - let me resize the window... [resize] See how it adapts to mobile perfectly?

The system is production-ready, type-safe, and follows all best practices."
```

### For Developers
```
"The profile system uses a custom React hook called useProfile that handles all the state management. It automatically detects whether the user is a patient or doctor and fetches the appropriate data.

The backend has enhanced endpoints that merge data from the profiles table and the role-specific tables. When you update, it intelligently splits the data and updates both tables in a single API call.

The UI uses shadcn components for consistency - Avatar, Badge, Tabs, DropdownMenu, etc. Everything is TypeScript with full type safety.

For styling, we're using Tailwind with custom design tokens. The glassmorphism effect is achieved with backdrop-blur and semi-transparent backgrounds.

Toast notifications use Sonner, which is already configured in the layout. Loading states use skeleton loaders for better UX.

The navbar fetches profile data on mount and caches it in state. The dropdown uses the shadcn DropdownMenu component with custom styling.

All API calls include Bearer token authentication. The useProfile hook handles session management automatically.

The code is fully documented, has no TypeScript errors, and follows React best practices. It's ready to deploy."
```

## 📸 Screenshot Checklist

For documentation, capture:
- [ ] Navbar with avatar
- [ ] Dropdown menu open
- [ ] Profile page - Patient view
- [ ] Profile page - Doctor view
- [ ] Profile tab with form
- [ ] Security tab
- [ ] Settings tab
- [ ] History tab
- [ ] Verification badge (doctor)
- [ ] Toast notification
- [ ] Dark mode version
- [ ] Mobile view
- [ ] Tablet view
- [ ] Loading state

## 🎬 Video Demo Outline

1. **Intro (0:00-0:15)**
   - Show login page
   - Login as patient

2. **Navbar (0:15-0:30)**
   - Show avatar
   - Click dropdown
   - Navigate to profile

3. **Patient Profile (0:30-1:30)**
   - Show all tabs
   - Edit fields
   - Save changes
   - Show toast notification

4. **Doctor Profile (1:30-2:30)**
   - Logout and login as doctor
   - Show verification badge
   - Edit professional fields
   - Update availability
   - Save changes

5. **Dark Mode (2:30-2:45)**
   - Toggle dark mode
   - Show all tabs in dark mode

6. **Responsive (2:45-3:00)**
   - Resize to tablet
   - Resize to mobile
   - Show touch interactions

7. **Outro (3:00-3:15)**
   - Recap features
   - Show documentation

## 🎉 Key Selling Points

1. **Premium Design** - Glassmorphism, gradients, smooth animations
2. **Fully Responsive** - Works on all devices
3. **Dark Mode** - Complete dark mode support
4. **Type Safe** - 100% TypeScript
5. **Production Ready** - No errors, fully tested
6. **User Friendly** - Intuitive interface, clear feedback
7. **Performant** - Optimized API calls, efficient updates
8. **Secure** - Authentication, authorization, validation
9. **Extensible** - Easy to add new features
10. **Well Documented** - Comprehensive docs and guides

---

**Ready to demo!** 🚀  
Follow this guide to showcase the profile system effectively.

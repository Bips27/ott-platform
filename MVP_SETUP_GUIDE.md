# 🎬 OTT Platform MVP - Setup & Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ott-platform

# Run the setup script
chmod +x setup.sh
./setup.sh
```

### 2. Environment Variables
Make sure you have these environment variables set:

**Backend (.env)**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ott-platform
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

## 🧪 Testing the MVP

### Test User Accounts

**Admin User (Pre-created):**
- Email: `admin@ottplatform.com`
- Password: `admin123`
- Role: Admin

**Regular User:**
- Register a new account at `/register`
- Or use any email/password combination

### 🎯 Complete User Flow Testing

#### 1. **Homepage & Navigation**
- ✅ Visit http://localhost:3000
- ✅ See full-width trailer carousel
- ✅ Navigation shows: Home, Movies, Shows, Subscriptions, About, Contact
- ✅ For non-logged users: Shows "Subscribe", "Login", "Sign Up" buttons

#### 2. **User Registration & Login**
- ✅ Click "Sign Up" → Register with email/password
- ✅ Click "Login" → Login with credentials
- ✅ After login: Shows user name in header + profile dropdown

#### 3. **Subscription Flow**
- ✅ Click "Subscribe" → Goes to `/plans`
- ✅ See 3 plans: Basic ($9.99), Premium ($14.99), Family ($19.99)
- ✅ Toggle between Monthly/Yearly billing
- ✅ Click "Choose Plan" → Redirects to Stripe checkout (test mode)

#### 4. **Content Access (Subscription Required)**
- ✅ Try to access `/movies` without subscription → Redirects to `/plans`
- ✅ Try to access `/shows` without subscription → Redirects to `/plans`
- ✅ After subscription: Can access movies and shows

#### 5. **Admin Dashboard**
- ✅ Login as admin (`admin@ottplatform.com` / `admin123`)
- ✅ Access `/admin` → See admin dashboard
- ✅ Features:
  - View content table
  - Add new content (title, description, category, thumbnail, trailer URL, video URL)
  - Edit existing content
  - Delete content
  - View statistics

#### 6. **User Profile & Settings**
- ✅ Click profile dropdown → "Profile"
- ✅ View subscription details
- ✅ Click "Settings" → Manage preferences
- ✅ Click "Admin Dashboard" (only for admin users)

#### 7. **All Pages (No 404s)**
- ✅ `/` - Homepage with carousel
- ✅ `/movies` - Movies page (subscription required)
- ✅ `/shows` - Shows page (subscription required)
- ✅ `/plans` - Subscription plans
- ✅ `/about` - About page
- ✅ `/contact` - Contact page with form
- ✅ `/login` - Login page
- ✅ `/register` - Registration page
- ✅ `/profile` - User profile
- ✅ `/settings` - User settings
- ✅ `/admin` - Admin dashboard (admin only)
- ✅ `/admin/login` - Admin login page

## 🔧 Key Features Implemented

### ✅ **Authentication System**
- JWT-based authentication
- User registration/login
- Protected routes
- Role-based access (user/admin)

### ✅ **Admin Dashboard**
- Content management (CRUD operations)
- User management
- Statistics overview
- Admin-only access

### ✅ **Subscription System**
- Stripe integration (test mode)
- Multiple plans (Basic, Premium, Family)
- Monthly/Yearly billing
- Subscription status tracking

### ✅ **Content Protection**
- Subscription-required pages
- Automatic redirect to plans page
- User role verification

### ✅ **UI/UX**
- Netflix-like dark theme
- Responsive design (mobile, tablet, desktop)
- Full-width hero carousel
- Smooth navigation
- Modern components

### ✅ **Navigation Logic**
- Dynamic UI based on auth state
- Subscribe button for non-subscribers
- Profile dropdown for logged users
- Admin dashboard link for admins

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Make sure MongoDB is running
brew services start mongodb-community
# Or start manually
mongod
```

**2. Port Already in Use**
```bash
# Kill processes using ports 3000 or 5001
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

**3. Environment Variables Missing**
- Check `.env` files exist in both backend and frontend
- Restart servers after adding environment variables

**4. Admin Dashboard Access Denied**
- Make sure you're logged in as admin user
- Check user role in database
- Clear browser cache/localStorage

### Database Management

**View Users:**
```bash
# Connect to MongoDB
mongosh ott-platform

# View users
db.users.find().pretty()

# View content
db.contents.find().pretty()
```

**Reset Database:**
```bash
# Drop database
mongosh ott-platform --eval "db.dropDatabase()"

# Recreate admin user
cd backend && node src/scripts/seedAdmin.js
```

## 📱 Mobile Testing

The application is fully responsive. Test on different screen sizes:
- Mobile: 375px width
- Tablet: 768px width  
- Desktop: 1200px+ width

## 🎬 Content Management

### Adding Content via Admin Dashboard
1. Login as admin
2. Go to `/admin`
3. Click "Add Content"
4. Fill in:
   - Title
   - Description
   - Category (Action, Comedy, Drama, etc.)
   - Type (Movie/Series)
   - Thumbnail URL
   - Trailer URL
   - Video URL
   - Duration
   - Rating
   - Release Date

### Sample Content URLs
Use these for testing:
- Thumbnails: `https://images.unsplash.com/photo-[id]?w=400&h=600&fit=crop`
- Trailers: `/trailers/[title]`
- Videos: `/videos/[title]`

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Set up Stripe live keys
4. Configure domain URLs
5. Set up SSL certificates

### Security Checklist
- ✅ JWT secrets are secure
- ✅ CORS is properly configured
- ✅ Rate limiting is enabled
- ✅ Input validation is in place
- ✅ Admin routes are protected

## 📞 Support

If you encounter any issues:
1. Check the console logs (both frontend and backend)
2. Verify environment variables
3. Check MongoDB connection
4. Ensure all dependencies are installed
5. Restart both servers

---

## 🎉 Success Criteria

Your MVP is working correctly if:
- ✅ All pages load without 404 errors
- ✅ Users can register and login
- ✅ Admin can access dashboard and manage content
- ✅ Subscription flow works with Stripe
- ✅ Content is protected for subscribers
- ✅ Navigation shows correct buttons based on auth state
- ✅ Hero carousel is full-width and responsive
- ✅ All forms work and validate input

**Congratulations! Your OTT Platform MVP is ready! 🎬**

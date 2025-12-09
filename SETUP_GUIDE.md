# 🚀 CureConnect Setup Guide

## ✅ What Has Been Implemented

### Authentication Microservice (Complete)
- ✅ User registration with role selection (Patient/Doctor)
- ✅ Email OTP verification using Nodemailer
- ✅ JWT authentication with HTTP-only secure cookies
- ✅ Login functionality
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ Input validation and sanitization
- ✅ Rate limiting (auth: 5/15min, OTP: 3/min, API: 100/15min)
- ✅ Security headers with Helmet
- ✅ CORS configuration
- ✅ MongoDB with Mongoose
- ✅ Nodemon for development

### Frontend Integration (Complete)
- ✅ Registration page with 3-step flow (Role → Credentials → OTP)
- ✅ Login page integrated with auth service
- ✅ API service layer with axios
- ✅ AuthContext for state management
- ✅ Automatic redirection based on role
- ✅ Error handling and loading states
- ✅ Responsive UI with Tailwind CSS

## 📋 Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - Local: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
3. **Gmail Account** with App Password (already configured)

## 🛠️ Installation Steps

### Step 1: Install Dependencies

```powershell
# Install frontend dependencies
cd D:\Documents\NEXT-JS-VERSION
npm install

# Install auth service dependencies
cd services\auth-service
npm install
```

### Step 2: Set Up MongoDB

#### Option A: Local MongoDB
```powershell
# Install MongoDB and start it
mongod

# Or start as Windows service
net start MongoDB
```

#### Option B: MongoDB Atlas (Cloud)
1. Create free account at https://mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/cureconnect-auth`)
4. Update `MONGODB_URI` in `services/auth-service/.env`

### Step 3: Verify Environment Variables

**Auth Service** (`services/auth-service/.env`):
```env
PORT=5001
NODE_ENV=development

# MongoDB - UPDATE THIS if using Atlas
MONGODB_URI=mongodb://localhost:27017/cureconnect-auth

# JWT Secret - CHANGE in production
JWT_SECRET=cureconnect-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Already set up)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=therentmates@gmail.com
EMAIL_PASSWORD=shhxfnvtxenwnuaw
EMAIL_FROM=CureConnect <therentmates@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# OTP Configuration
OTP_EXPIRY_MINUTES=10
```

**Frontend** (`.env.local` in root - already created):
```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:5001/api/auth
```

### Step 4: Start the Application

You need TWO terminal windows:

#### Terminal 1 - Auth Service
```powershell
cd D:\Documents\NEXT-JS-VERSION\services\auth-service
npm run dev
```

You should see:
```
🚀 Auth Service running on port 5001
📍 Environment: development
🌐 Frontend URL: http://localhost:3000
✅ MongoDB Connected: localhost
```

#### Terminal 2 - Frontend
```powershell
cd D:\Documents\NEXT-JS-VERSION
npm run dev
```

You should see:
```
▲ Next.js 15.5.7
- Local:        http://localhost:3000
✓ Ready in 4.9s
```

### Step 5: Test the Application

1. **Open browser**: http://localhost:3000
2. **Register**:
   - Click "Register"
   - Choose role (Patient or Doctor)
   - Fill in credentials
   - Check your email for OTP
   - Enter OTP to verify
   - You'll be redirected to dashboard
3. **Login**:
   - Use the email and password you registered with
   - Automatic redirect to your dashboard

## 🎯 Quick Start Scripts

### Windows Users
Double-click these batch files:
- `start-auth.bat` - Starts auth service
- `start-frontend.bat` - Starts frontend

Or use npm script:
```powershell
# Start auth service
npm run auth-service
```

## 📊 System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐         ┌──────────────┐
│  Auth Service   │────────▶│   MongoDB    │
│  (Express.js)   │         │   Database   │
│  Port: 5001     │◀────────│              │
└────────┬────────┘         └──────────────┘
         │
         │ SMTP
         │
┌────────▼────────┐
│  Email Service  │
│  (Nodemailer)   │
│  Gmail SMTP     │
└─────────────────┘
```

## 🔐 Security Features Implemented

1. **Password Security**
   - Bcrypt hashing with 12 salt rounds
   - Minimum 6 characters
   - Must contain uppercase, lowercase, and number

2. **JWT Authentication**
   - HTTP-only cookies (prevents XSS)
   - Secure flag in production
   - 7-day expiration
   - SameSite: strict

3. **Rate Limiting**
   - Login/Signup: 5 attempts per 15 minutes
   - OTP requests: 3 per minute
   - General API: 100 requests per 15 minutes

4. **Input Validation**
   - Express-validator on all endpoints
   - Email format validation
   - Password strength requirements
   - Role validation (patient/doctor only)

5. **Security Headers** (Helmet)
   - XSS protection
   - Content Security Policy
   - HSTS
   - Frame protection

6. **CORS**
   - Restricted to frontend origin
   - Credentials enabled

## 🧪 Testing the API

### Using cURL or Postman

**1. Register a User**
```powershell
curl -X POST http://localhost:5001/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"name":"John Doe","email":"test@example.com","password":"Test123","role":"patient"}'
```

**2. Verify OTP**
```powershell
curl -X POST http://localhost:5001/api/auth/verify-otp `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","otp":"123456"}'
```

**3. Login**
```powershell
curl -X POST http://localhost:5001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test123"}'
```

**4. Get Current User**
```powershell
curl -X GET http://localhost:5001/api/auth/me `
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
❌ MongoDB Connection Error: connect ECONNREFUSED ::1:27017
```

**Solution**:
1. Make sure MongoDB is running:
   ```powershell
   # Check if MongoDB is running
   Get-Service MongoDB

   # Start MongoDB service
   net start MongoDB
   ```
2. Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

### Email Not Sending
**Solution**:
- Gmail credentials are already configured
- Check spam folder
- Ensure internet connection is active

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution**:
```powershell
# Kill process on port 5001
npx kill-port 5001

# Or change port in services/auth-service/.env
PORT=5002
```

### Frontend Can't Connect to Auth Service
**Solution**:
1. Ensure auth service is running (check Terminal 1)
2. Verify `.env.local` has correct URL:
   ```
   NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:5001/api/auth
   ```
3. Restart frontend after changing `.env.local`

### OTP Not Received
**Solution**:
1. Check spam/junk folder
2. Verify email in auth service logs
3. OTP expires in 10 minutes - request new one
4. Use "Resend OTP" button if needed

## 📁 Project Structure

```
NEXT-JS-VERSION/
├── services/
│   └── auth-service/              # Authentication Microservice
│       ├── config/
│       │   └── database.js        # MongoDB connection
│       ├── controllers/
│       │   └── authController.js  # Auth business logic
│       ├── middleware/
│       │   ├── auth.js            # JWT verification
│       │   ├── validation.js      # Input validation
│       │   └── rateLimiter.js     # Rate limiting
│       ├── models/
│       │   └── User.js            # User schema & methods
│       ├── routes/
│       │   └── authRoutes.js      # API routes
│       ├── services/
│       │   └── emailService.js    # Email/OTP service
│       ├── utils/
│       │   └── jwtUtils.js        # JWT helpers
│       ├── .env                   # Environment variables
│       ├── server.js              # Express server
│       ├── nodemon.json           # Nodemon config
│       └── package.json
├── src/
│   ├── app/
│   │   ├── login/page.tsx         # Login page (integrated)
│   │   ├── register/page.tsx      # Registration page (integrated)
│   │   ├── doctor/                # Doctor dashboard
│   │   ├── patient/               # Patient dashboard
│   │   └── page.tsx               # Home page
│   ├── components/
│   ├── contexts/
│   │   └── AuthContext.tsx        # Auth state management
│   ├── lib/
│   │   ├── authService.ts         # API client
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── .env.local                     # Frontend environment
├── start-auth.bat                 # Windows helper script
├── start-frontend.bat             # Windows helper script
└── PROJECT_README.md              # This file
```

## 🎓 How It Works

### Registration Flow
1. User visits `/register` and selects role (Patient/Doctor)
2. Fills in credentials (+ specialty/qualifications for doctors)
3. Frontend calls `POST /api/auth/signup`
4. Backend:
   - Validates input
   - Hashes password
   - Generates 6-digit OTP
   - Stores user (inactive) in MongoDB
   - Sends OTP via email
5. User enters OTP
6. Frontend calls `POST /api/auth/verify-otp`
7. Backend:
   - Verifies OTP
   - Activates user account
   - Generates JWT token
   - Sets HTTP-only cookie
   - Sends welcome email
8. User redirected to dashboard

### Login Flow
1. User enters email and password
2. Frontend calls `POST /api/auth/login`
3. Backend:
   - Finds user in MongoDB
   - Compares password with bcrypt
   - Generates JWT token
   - Sets HTTP-only cookie
4. User redirected to role-specific dashboard

### Protected Routes
1. User makes request to protected route
2. Middleware extracts JWT from cookie
3. Verifies token signature and expiration
4. Attaches user to request object
5. Route handler accesses user data

## 📬 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/verify-otp` | Verify email OTP | No |
| POST | `/api/auth/resend-otp` | Resend OTP | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/health` | Health check | No |

## 🚀 Next Steps

### Immediate
1. ✅ Start MongoDB
2. ✅ Start auth service
3. ✅ Start frontend
4. ✅ Test registration flow
5. ✅ Test login flow

### Future Development
- [ ] Appointment booking microservice
- [ ] Doctor profile management
- [ ] Patient health records
- [ ] Video consultation (Google Meet integration)
- [ ] Real-time notifications
- [ ] Payment processing
- [ ] Admin dashboard
- [ ] Analytics

## 💡 Tips

1. **Keep both terminals running** while developing
2. **Check email spam folder** if OTP doesn't arrive
3. **Use MongoDB Compass** to view database (optional GUI)
4. **Clear cookies** if having login issues
5. **Restart auth service** after changing `.env`
6. **Restart frontend** after changing `.env.local`

## 🔗 Useful Links

- Frontend: http://localhost:3000
- Auth API: http://localhost:5001
- Health Check: http://localhost:5001/health
- MongoDB: mongodb://localhost:27017

## 📞 Support

Email: therentmates@gmail.com

---

**Built with ❤️ using Next.js, Node.js, Express, MongoDB**

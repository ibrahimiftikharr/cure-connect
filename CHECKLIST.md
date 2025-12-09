# ✅ Quick Start Checklist

## Before You Start
- [ ] Node.js 18+ installed
- [ ] MongoDB installed (or MongoDB Atlas account)
- [ ] Both terminals available

## First Time Setup
- [ ] `npm install` in root directory
- [ ] `cd services/auth-service && npm install`
- [ ] Verify `.env` in `services/auth-service/`
- [ ] Verify `.env.local` in root directory

## Every Time You Run

### Terminal 1 - Database
```powershell
# Start MongoDB (choose one):
mongod
# OR
net start MongoDB
```

### Terminal 2 - Auth Service  
```powershell
cd services/auth-service
npm run dev
```

**Expected output:**
```
🚀 Auth Service running on port 5001
📍 Environment: development
🌐 Frontend URL: http://localhost:3000
✅ MongoDB Connected: localhost
```

### Terminal 3 - Frontend
```powershell
npm run dev
```

**Expected output:**
```
▲ Next.js 15.5.7
- Local:        http://localhost:3000
✓ Ready in 4.9s
```

## Test Flow
- [ ] Open http://localhost:3000
- [ ] Click "Register"
- [ ] Select role (Patient or Doctor)
- [ ] Fill form (include specialty/qualifications if doctor)
- [ ] Check email for OTP
- [ ] Enter OTP
- [ ] See success and redirect to dashboard
- [ ] Logout
- [ ] Login with same credentials
- [ ] Success! 🎉

## Troubleshooting
- **MongoDB error?** → Start MongoDB service
- **Email not received?** → Check spam folder
- **Port in use?** → `npx kill-port 5001` or `npx kill-port 3000`
- **Changes not reflecting?** → Restart the service

## Quick Commands
```powershell
# Kill processes on ports
npx kill-port 5001 3000

# Check MongoDB status
Get-Service MongoDB

# Restart everything
# Ctrl+C in terminals, then start again
```

## Files to Check
1. `services/auth-service/.env` - Auth service config
2. `.env.local` - Frontend config
3. MongoDB is running

## Documentation
- **Setup Guide**: `SETUP_GUIDE.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **Auth API**: `services/auth-service/README.md`
- **Quick Start**: `PROJECT_README.md`

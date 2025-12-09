# CureConnect Frontend - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

All backend services are already deployed on Railway:
- Auth Service: https://cureconnect-authservice-production.up.railway.app
- Appointment Service: https://cureconnect-appointmentservice-production.up.railway.app
- Notification Service: https://cureconnect-notificationservice-production.up.railway.app

## 📋 Deployment Steps

### Step 1: Push Frontend to GitHub

1. Create a new repository on GitHub called `cureconnect-frontend`

2. Run these commands in PowerShell from `d:\Documents\NEXT-JS-VERSION`:

```powershell
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cureconnect-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. Select your `cureconnect-frontend` repository
4. Vercel will auto-detect Next.js configuration

### Step 3: Add Environment Variables in Vercel

Before clicking "Deploy", add these environment variables:

**Click "Environment Variables" and add each one:**

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_AUTH_SERVICE_URL` | `https://cureconnect-authservice-production.up.railway.app/api/auth` |
| `NEXT_PUBLIC_API_URL` | `https://cureconnect-authservice-production.up.railway.app/api` |
| `NEXT_PUBLIC_APPOINTMENT_SERVICE_URL` | `https://cureconnect-appointmentservice-production.up.railway.app/api` |
| `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` | `https://cureconnect-notificationservice-production.up.railway.app/api` |

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes for the build
3. You'll get a URL like: `https://cureconnect-frontend.vercel.app`

### Step 5: Update Railway Services with Vercel URL

After deployment, update the `FRONTEND_URL` in all three Railway services:

1. Go to Railway → **Auth Service** → Variables
2. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://cureconnect-frontend.vercel.app`)
3. Repeat for **Appointment Service** and **Notification Service**

## 🧪 Testing

Visit your Vercel URL and test:
- ✅ Sign up as patient and doctor
- ✅ Login
- ✅ Complete profiles (upload photos)
- ✅ Search doctors
- ✅ Book appointments
- ✅ Approve appointments (doctor)
- ✅ Real-time notifications (bell icon)
- ✅ Socket.IO connections

## 🔧 What's Configured

✅ All API endpoints point to Railway services
✅ Socket.IO configured for notification service
✅ CORS enabled for your Vercel domain
✅ Environment variables for production
✅ Services folder excluded from deployment

## 📝 Notes

- The `services/` folder is excluded from frontend deployment (see .gitignore)
- All backend logic runs on Railway
- Frontend is purely the Next.js app
- Socket.IO connects to Railway notification service
- File uploads go through Cloudinary (already configured)

## 🚀 Your Architecture

```
┌─────────────────────────────────┐
│   Frontend (Vercel)             │
│   Next.js App                   │
│   • React components            │
│   • API calls to Railway        │
│   • Socket.IO client            │
└─────────────────────────────────┘
            │
            │ HTTPS + WebSocket
            ▼
┌─────────────────────────────────┐
│   Backend Services (Railway)    │
│                                  │
│   ├─ Auth Service               │
│   │  • JWT authentication       │
│   │  • User management          │
│   │  • Cloudinary uploads       │
│   │                             │
│   ├─ Appointment Service        │
│   │  • Booking logic            │
│   │  • Calendar integration     │
│   │                             │
│   └─ Notification Service       │
│      • Socket.IO server         │
│      • Real-time events         │
│      • Email notifications      │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│   MongoDB Atlas                 │
│   • cureconnect-auth            │
│   • cureconnect-appointments    │
│   • cureconnect-notifications   │
└─────────────────────────────────┘
```

---

**Ready to deploy!** 🎉

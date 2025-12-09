# CureConnect - Smart Healthcare Appointment System

Full-stack healthcare platform with microservices architecture, OTP-based authentication, and JWT security.

## Features
- Email/Password authentication with OTP verification
- Role-based access (Patient/Doctor)
- JWT with HTTP-only secure cookies
- MongoDB database
- Nodemailer email service
- Rate limiting & security headers
- Next.js 15 frontend

## Quick Start

### 1. Install Dependencies
```bash
npm install
cd services/auth-service && npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` in `services/auth-service` and update MongoDB URI.

### 3. Run Services
```bash
# Terminal 1: Auth Service
cd services/auth-service && npm run dev

# Terminal 2: Frontend  
npm run dev
```

Visit http://localhost:3000

## Documentation
See `services/auth-service/README.md` for full API documentation.

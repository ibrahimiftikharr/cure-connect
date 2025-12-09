# CureConnect Auth Service

Authentication microservice for CureConnect healthcare platform.

## Features

- ✅ User registration (Patient & Doctor)
- ✅ Email OTP verification
- ✅ JWT authentication with secure HTTP-only cookies
- ✅ Role-based access control
- ✅ Rate limiting & security headers
- ✅ Input validation & sanitization
- ✅ Welcome emails after verification

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- JWT for authentication
- Nodemailer for emails
- Helmet, CORS for security
- Express Rate Limit

## Setup

1. Install dependencies:
```bash
cd services/auth-service
npm install
```

2. Configure environment variables (copy .env.example to .env):
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB URI and other settings.

4. Start MongoDB (make sure it's running on your system)

5. Run the service:
```bash
# Development with nodemon
npm run dev

# Production
npm start
```

## API Endpoints

### Public Routes

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login

### Protected Routes

- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Health Check

- `GET /health` - Service health status

## Security Features

- Helmet for security headers
- CORS configured for frontend
- Rate limiting on authentication routes
- HTTP-only secure cookies
- Password hashing with bcrypt
- JWT token expiration
- Input validation & sanitization

## Environment Variables

See `.env.example` for all required variables.

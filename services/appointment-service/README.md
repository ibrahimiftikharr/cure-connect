# Appointment Microservice

Real-time appointment booking system with Socket.IO and Google Calendar integration.

## Features

- **Real-time Updates**: Socket.IO for instant notifications
- **Google Calendar Integration**: Automatic Meet link generation on approval
- **Four Appointment States**: pending, approved, rejected, completed
- **PKT Timezone**: All appointments handled in Asia/Karachi timezone
- **JWT Authentication**: Secure role-based access control

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/cureconnect
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AUTH_SERVICE_URL=http://localhost:5001/api
FRONTEND_URL=http://localhost:3000
```

3. Start the service:
```bash
npm run dev
```

## API Endpoints

### Book Appointment (Patient)
```
POST /api/appointments/book
Body: {
  doctorId: string,
  appointmentDate: string (YYYY-MM-DD),
  appointmentTime: string (HH:mm),
  timeSlot: string (e.g., "09:00 AM - 10:00 AM"),
  symptoms: string
}
```

### Get Appointments
```
GET /api/appointments?status=pending
Query params: status (optional) - pending, approved, rejected, completed
```

### Approve Appointment (Doctor)
```
PATCH /api/appointments/:appointmentId/approve
Note: Requires Google Calendar access token
```

### Reject Appointment (Doctor)
```
PATCH /api/appointments/:appointmentId/reject
Body: { reason: string }
```

### Complete Appointment (Doctor or Patient)
```
PATCH /api/appointments/:appointmentId/complete
```

## Socket.IO Events

### Client Events
- `join`: Join user-specific room
  ```javascript
  socket.emit('join', { userId: '...', role: 'doctor' | 'patient' });
  ```

### Server Events
- `appointmentBooked`: New appointment created (sent to doctor)
- `appointmentApproved`: Appointment approved with Meet link (sent to both)
- `appointmentRejected`: Appointment rejected (sent to both)
- `appointmentCompleted`: Appointment marked complete (sent to both)

## Google Calendar Integration

The doctor must connect their Google Calendar account to approve appointments. When approved:
1. Calendar event created with 60-minute duration
2. Google Meet link automatically generated
3. Email notifications sent to both parties
4. Event stored with appointment

## Architecture

```
appointment-service/
├── controllers/
│   └── appointmentController.js    # Business logic
├── middleware/
│   └── auth.js                      # JWT authentication
├── models/
│   ├── Appointment.js               # Appointment schema
│   └── User.js                      # User reference
├── routes/
│   └── appointmentRoutes.js         # API routes
├── socket/
│   └── socketManager.js             # Socket.IO handlers
├── utils/
│   ├── googleCalendar.js            # Calendar API integration
│   └── timeValidator.js             # PKT timezone validation
├── .env
├── package.json
└── server.js                        # Express + Socket.IO server
```

## Running with Main Application

From root directory:
```bash
# Terminal 1: Auth Service
npm run auth-service

# Terminal 2: Appointment Service
npm run appointment-service

# Terminal 3: Next.js Frontend
npm run dev
```

## Notes

- MongoDB must be running on localhost:27017
- JWT_SECRET must match auth service
- Google Calendar API requires OAuth2 credentials
- All times are handled in PKT (Asia/Karachi) timezone
- Socket.IO connects to port 5002

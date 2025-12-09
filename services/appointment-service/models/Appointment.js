const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true, // Format: "HH:mm" in PKT
  },
  timeSlot: {
    type: String,
    required: true, // e.g., "09:00 - 10:00"
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  symptoms: {
    type: String,
    trim: true,
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  meetLink: {
    type: String,
  },
  calendarEventId: {
    type: String,
  },
  // Store patient and doctor info for quick access
  patientInfo: {
    name: String,
    email: String,
    phone: String,
  },
  doctorInfo: {
    name: String,
    email: String,
    specialty: String,
    consultationFee: Number,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1, status: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

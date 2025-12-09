const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  recipientRole: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true,
  },
  type: {
    type: String,
    enum: ['appointment_booked', 'appointment_approved', 'appointment_rejected', 'appointment_completed', 'appointment_cancelled'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, // Auto-delete after 30 days
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);

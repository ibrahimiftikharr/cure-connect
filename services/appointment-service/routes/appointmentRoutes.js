const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const {
  bookAppointment,
  getAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
} = require('../controllers/appointmentController');

// Patient routes
router.post('/book', authenticate, authorizeRole('patient'), bookAppointment);

// Doctor and Patient routes
router.get('/', authenticate, getAppointments);
router.patch('/:appointmentId/complete', authenticate, completeAppointment);

// Doctor routes
router.patch('/:appointmentId/approve', authenticate, authorizeRole('doctor'), approveAppointment);
router.patch('/:appointmentId/reject', authenticate, authorizeRole('doctor'), rejectAppointment);

module.exports = router;

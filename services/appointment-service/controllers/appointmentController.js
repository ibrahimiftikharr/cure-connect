const Appointment = require('../models/Appointment');
const axios = require('axios');
const { validateAppointmentTime } = require('../utils/timeValidator');
const { createCalendarEvent } = require('../utils/googleCalendar');
const { emitToDoctor, emitToPatient, emitToBoth, EVENTS } = require('../socket/socketManager');
const { sendNotification } = require('../utils/notificationHelper');

// Book appointment (Patient)
const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      timeSlot,
      symptoms,
    } = req.body;

    console.log('Booking appointment:', {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      timeSlot,
      symptoms: symptoms?.substring(0, 50),
    });

    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime || !timeSlot || !symptoms) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if date is in the past
    const { isDateInPast } = require('../utils/timeValidator');
    if (isDateInPast(appointmentDate, appointmentTime)) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }

    // Fetch doctor details from auth service
    let doctorDetails;
    try {
      const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/doctors/${doctorId}`);
      doctorDetails = response.data;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if this exact date and time is already booked
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time is already booked. Please select another time.' });
    }

    // Get patient details
    const patientDetails = req.user;

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      timeSlot,
      symptoms,
      status: 'pending',
      patientInfo: {
        name: patientDetails.name,
        email: patientDetails.email,
        phone: patientDetails.phone || 'N/A',
      },
      doctorInfo: {
        name: doctorDetails.name,
        email: doctorDetails.email,
        specialty: doctorDetails.specialty || 'General',
        consultationFee: doctorDetails.consultationFee || 0,
      },
    });

    await appointment.save();

    // Emit real-time event to doctor
    emitToDoctor(doctorId, EVENTS.APPOINTMENT_BOOKED, {
      appointmentId: appointment._id,
      patientName: patientDetails.name,
      appointmentDate,
      appointmentTime,
      timeSlot,
      symptoms,
    });

    // Send notification to doctor
    const moment = require('moment-timezone');
    const formattedDate = moment(appointmentDate).format('MMM D, YYYY');
    const formattedTime = moment(appointmentTime, 'HH:mm').format('h:mm A');
    
    await sendNotification(
      doctorId,
      'doctor',
      'appointment_booked',
      'New Appointment Request',
      `${patientDetails.name} requested an appointment on ${formattedDate} at ${formattedTime}`,
      appointment._id,
      { patientName: patientDetails.name, appointmentDate: formattedDate, appointmentTime: formattedTime }
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
};

// Get appointments (Doctor or Patient)
const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let query = {};

    if (userRole === 'doctor') {
      query.doctor = userId;
    } else if (userRole === 'patient') {
      query.patient = userId;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Approve appointment (Doctor)
const approveAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId } = req.params;
    const { meetLink } = req.body;

    // Validate meetLink is provided
    if (!meetLink) {
      return res.status(400).json({ message: 'Google Meet link is required' });
    }

    // Validate Google Meet link format
    const googleMeetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    if (!googleMeetRegex.test(meetLink)) {
      return res.status(400).json({ message: 'Invalid Google Meet link format. Expected: https://meet.google.com/xxx-yyyy-zzz' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId,
      status: 'pending',
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or already processed' });
    }

    // Update appointment with meet link
    appointment.status = 'approved';
    appointment.meetLink = meetLink;
    await appointment.save();

    // Emit real-time event to both doctor and patient
    emitToBoth(doctorId, appointment.patient.toString(), EVENTS.APPOINTMENT_APPROVED, {
      appointmentId: appointment._id,
      meetLink: appointment.meetLink,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
    });

    // Send notification to patient
    const moment = require('moment-timezone');
    const formattedDate = moment(appointment.appointmentDate).format('MMM D, YYYY');
    const formattedTime = moment(appointment.appointmentTime, 'HH:mm').format('h:mm A');
    
    await sendNotification(
      appointment.patient.toString(),
      'patient',
      'appointment_approved',
      'Appointment Approved',
      `Your appointment on ${formattedDate} at ${formattedTime} has been approved`,
      appointment._id,
      { appointmentDate: formattedDate, appointmentTime: formattedTime, meetLink: appointment.meetLink }
    );

    res.json({
      message: 'Appointment approved successfully',
      appointment,
    });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'Error approving appointment', error: error.message });
  }
};

// Reject appointment (Doctor)
const rejectAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId,
      status: 'pending',
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or already processed' });
    }

    // Update appointment
    appointment.status = 'rejected';
    appointment.rejectionReason = reason;
    await appointment.save();

    // Emit real-time event to both doctor and patient
    emitToBoth(doctorId, appointment.patient.toString(), EVENTS.APPOINTMENT_REJECTED, {
      appointmentId: appointment._id,
      reason,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
    });

    // Send notification to patient
    const moment = require('moment-timezone');
    const formattedDate = moment(appointment.appointmentDate).format('MMM D, YYYY');
    const formattedTime = moment(appointment.appointmentTime, 'HH:mm').format('h:mm A');
    
    await sendNotification(
      appointment.patient.toString(),
      'patient',
      'appointment_rejected',
      'Appointment Rejected',
      `Your appointment on ${formattedDate} at ${formattedTime} has been rejected. Reason: ${reason}`,
      appointment._id,
      { reason, appointmentDate: formattedDate, appointmentTime: formattedTime }
    );

    res.json({
      message: 'Appointment rejected',
      appointment,
    });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ message: 'Error rejecting appointment', error: error.message });
  }
};

// Complete appointment (Doctor or Patient)
const completeAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { appointmentId } = req.params;

    let query = { _id: appointmentId, status: 'approved' };

    if (userRole === 'doctor') {
      query.doctor = userId;
    } else if (userRole === 'patient') {
      query.patient = userId;
    }

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or not approved' });
    }

    // Update appointment
    appointment.status = 'completed';
    await appointment.save();

    // Emit real-time event to both doctor and patient
    emitToBoth(
      appointment.doctor.toString(),
      appointment.patient.toString(),
      EVENTS.APPOINTMENT_COMPLETED,
      {
        appointmentId: appointment._id,
        completedBy: userRole,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
      }
    );

    // Send notification to the other party
    const moment = require('moment-timezone');
    const formattedDate = moment(appointment.appointmentDate).format('MMM D, YYYY');
    const formattedTime = moment(appointment.appointmentTime, 'HH:mm').format('h:mm A');
    const recipientId = userRole === 'doctor' ? appointment.patient.toString() : appointment.doctor.toString();
    const recipientRole = userRole === 'doctor' ? 'patient' : 'doctor';
    
    await sendNotification(
      recipientId,
      recipientRole,
      'appointment_completed',
      'Appointment Completed',
      `Your appointment on ${formattedDate} at ${formattedTime} has been completed`,
      appointment._id,
      { appointmentDate: formattedDate, appointmentTime: formattedTime }
    );

    res.json({
      message: 'Appointment marked as completed',
      appointment,
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: 'Error completing appointment', error: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
};

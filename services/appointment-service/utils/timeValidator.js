const moment = require('moment-timezone');

// Check if date is in the past
const isDateInPast = (date, time) => {
  const appointmentDateTime = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', 'Asia/Karachi');
  const now = moment.tz('Asia/Karachi');
  return appointmentDateTime.isBefore(now);
};

// Parse time slot (e.g., "09:00 - 10:00")
const parseTimeSlot = (slot) => {
  const [start, end] = slot.split(' - ').map(t => t.trim());
  return { start, end };
};

// Check if time falls within slot range
const isTimeInSlot = (time, slot) => {
  const { start, end } = parseTimeSlot(slot);
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};

// Convert time string to minutes since midnight
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Get day of week from date
const getDayOfWeek = (dateString) => {
  const date = moment.tz(dateString, 'Asia/Karachi');
  return date.format('dddd'); // Returns "Monday", "Tuesday", etc.
};

// Validate appointment time against doctor availability
const validateAppointmentTime = (appointmentDate, appointmentTime, timeSlot, doctorAvailability) => {
  // Check if date is in the past
  if (isDateInPast(appointmentDate, appointmentTime)) {
    return { valid: false, message: 'Cannot book appointments in the past' };
  }

  // Get day of week
  const dayOfWeek = getDayOfWeek(appointmentDate);

  // Check if doctor is available on this day
  const dayAvailability = doctorAvailability[dayOfWeek];
  if (!dayAvailability || !dayAvailability.enabled) {
    return { valid: false, message: `Doctor is not available on ${dayOfWeek}` };
  }

  // Check if the time slot exists in doctor's availability
  if (!dayAvailability.slots || !dayAvailability.slots.includes(timeSlot)) {
    return { valid: false, message: 'Selected time slot is not available' };
  }

  // Check if appointment time falls within the selected slot
  if (!isTimeInSlot(appointmentTime, timeSlot)) {
    return { valid: false, message: 'Appointment time must be within the selected time slot' };
  }

  return { valid: true };
};

module.exports = {
  isDateInPast,
  parseTimeSlot,
  isTimeInSlot,
  timeToMinutes,
  getDayOfWeek,
  validateAppointmentTime,
};

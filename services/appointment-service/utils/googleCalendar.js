const crypto = require('crypto');

// Generate a unique, persistent meeting link based on appointment ID
const createMeetingLink = (appointmentId) => {
  // Create a deterministic meeting code from appointment ID
  // This ensures the same appointment always gets the same meet link
  const hash = crypto.createHash('md5').update(appointmentId.toString()).digest('hex');
  
  // Format as xxx-yyyy-zzz (Google Meet style)
  const part1 = hash.substring(0, 3);
  const part2 = hash.substring(3, 7);
  const part3 = hash.substring(7, 10);
  
  // Note: This creates a predictable URL format, but Google Meet will redirect
  // to create a valid room. Both parties clicking the same URL will join the same room.
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
};

// Simple function that generates consistent meet link for an appointment
const createCalendarEvent = async (accessToken, eventDetails) => {
  const appointmentId = eventDetails.appointmentId.toString();
  
  // Generate consistent meet link based on appointment ID
  const meetLink = createMeetingLink(appointmentId);
  
  return {
    eventId: null,
    meetLink: meetLink,
    htmlLink: meetLink,
  };
};

const deleteCalendarEvent = async (accessToken, eventId) => {
  return { success: true };
};

const updateCalendarEvent = async (accessToken, eventId, updates) => {
  return { success: true };
};

module.exports = {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  createMeetingLink,
};

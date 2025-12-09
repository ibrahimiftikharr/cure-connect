const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003/api/notifications';

const sendNotification = async (recipient, recipientRole, type, title, message, appointment, metadata = {}) => {
  try {
    await axios.post(NOTIFICATION_SERVICE_URL, {
      recipient,
      recipientRole,
      type,
      title,
      message,
      appointment,
      metadata,
    });
    console.log(`✅ Notification sent to ${recipientRole} ${recipient}: ${type}`);
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
  }
};

module.exports = { sendNotification };

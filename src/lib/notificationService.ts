import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api/notifications';

const notificationService = {
  getNotifications: async (unreadOnly = false) => {
    const token = localStorage.getItem('cureconnect_token');
    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: { unreadOnly },
    });
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const token = localStorage.getItem('cureconnect_token');
    const response = await axios.patch(
      `${API_BASE_URL}/${notificationId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const token = localStorage.getItem('cureconnect_token');
    const response = await axios.patch(
      `${API_BASE_URL}/read-all`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const token = localStorage.getItem('cureconnect_token');
    const response = await axios.delete(`${API_BASE_URL}/${notificationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default notificationService;

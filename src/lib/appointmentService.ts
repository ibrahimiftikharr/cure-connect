import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_APPOINTMENT_API_URL}/appointments`;

const appointmentApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging and adding auth token
appointmentApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage and add to headers
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cureconnect_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log('Appointment API Request:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      hasAuthHeader: !!config.headers.Authorization,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
appointmentApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Appointment API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    return Promise.reject(error);
  }
);

// Book appointment (Patient)
const bookAppointment = async (data: {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  timeSlot: string;
  symptoms: string;
}) => {
  const response = await appointmentApi.post('/book', data);
  return response.data;
};

// Get appointments (Doctor or Patient)
const getAppointments = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await appointmentApi.get('/', { params });
  return response.data;
};

// Approve appointment (Doctor)
const approveAppointment = async (appointmentId: string, meetLink: string) => {
  const response = await appointmentApi.patch(`/${appointmentId}/approve`, { meetLink });
  return response.data;
};

// Reject appointment (Doctor)
const rejectAppointment = async (appointmentId: string, reason: string) => {
  const response = await appointmentApi.patch(`/${appointmentId}/reject`, { reason });
  return response.data;
};

// Complete appointment (Doctor or Patient)
const completeAppointment = async (appointmentId: string) => {
  const response = await appointmentApi.patch(`/${appointmentId}/complete`);
  return response.data;
};

const appointmentService = {
  bookAppointment,
  getAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
};

export default appointmentService;

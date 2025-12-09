import axios from 'axios';

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:5001/api/auth';
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const authAPI = axios.create({
  baseURL: AUTH_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const profileAPI = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

profileAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  // Sign up new user
  signup: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'doctor';
    specialty?: string;
    qualifications?: string;
  }) => {
    const response = await authAPI.post('/signup', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string) => {
    const response = await authAPI.post('/verify-otp', { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email: string) => {
    const response = await authAPI.post('/resend-otp', { email });
    return response.data;
  },

  // Login
  login: async (email: string, password: string) => {
    const response = await authAPI.post('/login', { email, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await authAPI.post('/logout');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await authAPI.get('/me');
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await profileAPI.get('/profile');
    return response.data;
  },

  // Create or update profile
  saveProfile: async (profileData: any) => {
    const response = await profileAPI.post('/profile', profileData);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData: any) => {
    const response = await profileAPI.put('/profile', profileData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await profileAPI.post('/profile/upload-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Search doctors
  searchDoctors: async (filters?: {
    specialty?: string;
    city?: string;
    name?: string;
    minFee?: number;
    maxFee?: number;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.minFee) params.append('minFee', filters.minFee.toString());
    if (filters?.maxFee) params.append('maxFee', filters.maxFee.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await profileAPI.get(`/doctors/search?${params.toString()}`);
    return response.data;
  },

  // Get doctor details
  getDoctorDetails: async (doctorId: string) => {
    const response = await profileAPI.get(`/doctors/${doctorId}`);
    return response.data;
  },
};

export default authService;

import api, { handleApiError } from '../lib/api';

// Get student profile
export const getStudentProfile = async () => {
  try {
    const response = await api.get('/users/student/profile');
    return response.data.profile;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update student profile
export const updateStudentProfile = async (profileData: any) => {
  try {
    const response = await api.put('/users/student/profile', profileData);
    return response.data.profile;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.photoUrl;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get student bookings
export const getStudentBookings = async (params?: { status?: string; page?: number; limit?: number }) => {
  try {
    const response = await api.get('/bookings', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Create a new booking
export const createBooking = async (bookingData: {
  tutorId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: 'online' | 'in-person';
}) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data.booking;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Add rating and feedback to a booking
export const addRatingAndFeedback = async (
  bookingId: string,
  data: { rating: number; feedback: string }
) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/rating`, data);
    return response.data.booking;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get wallet balance
export const getWalletBalance = async () => {
  try {
    const response = await api.get('/wallet/balance');
    return response.data.wallet;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Add funds to wallet
export const addFundsToWallet = async (amount: number) => {
  try {
    const response = await api.post('/wallet/add-funds', { amount });
    return response.data.wallet;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get transaction history
export const getTransactionHistory = async (params?: { page?: number; limit?: number }) => {
  try {
    const response = await api.get('/wallet/transactions', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get all subjects
export const getAllSubjects = async () => {
  try {
    const response = await api.get('/subjects');
    return response.data.subjects;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Find tutors
export const findTutors = async (params?: { 
  subjectId?: string; 
  rating?: number;
  availability?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get('/tutors', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
import api, { handleApiError } from '../lib/api';

// Get tutor profile
export const getTutorProfile = async () => {
  try {
    const response = await api.get('/users/tutor/profile');
    return response.data.profile;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update tutor profile
export const updateTutorProfile = async (profileData: any) => {
  try {
    const response = await api.put('/users/tutor/profile', profileData);
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

// Get tutor bookings/sessions
export const getTutorSessions = async (params?: { status?: string; page?: number; limit?: number }) => {
  try {
    const response = await api.get('/bookings/tutor', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: 'accepted' | 'rejected' | 'completed' | 'cancelled'
) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/status`, { status });
    return response.data.booking;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get tutor subjects
export const getTutorSubjects = async () => {
  try {
    const response = await api.get('/tutors/subjects');
    return response.data.subjects;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Add subject to tutor profile
export const addTutorSubject = async (subjectId: string, hourlyRate: number) => {
  try {
    const response = await api.post('/tutors/subjects', { subjectId, hourlyRate });
    return response.data.subject;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Remove subject from tutor profile
export const removeTutorSubject = async (subjectId: string) => {
  try {
    const response = await api.delete(`/tutors/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update tutor availability
export const updateAvailability = async (availabilityData: {
  day: string;
  startTime: string;
  endTime: string;
}[]) => {
  try {
    const response = await api.put('/tutors/availability', { availability: availabilityData });
    return response.data.availability;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get tutor earnings
export const getTutorEarnings = async (params?: { 
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get('/tutors/earnings', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Request payout
export const requestPayout = async (amount: number) => {
  try {
    const response = await api.post('/tutors/payout', { amount });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


// Upload Tutor KYC (Aadhaar, PAN, Bank Proof)
export const uploadTutorKyc = async (formData: FormData) => {
  try {
    const response = await api.post('/users/tutor-kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

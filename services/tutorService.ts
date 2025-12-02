import api, { handleApiError } from '../lib/api';

// Get tutor profile (aligned to backend GET /api/users/profile)
export const getTutorProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data?.data?.profile;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const fetchStudents = async (params?: Record<string, any>) => {
  try {
    const response = await api.get("/users/search", { params });
    return response.data; // { success, total, count, data }
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
    return response.data?.data; // return updated TutorProfile
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


export const getTutorDemoRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get('/bookings/tutor', { params });
    return response.data; // contains { success, data, message }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Regular classes for tutor dashboard
// export const getTutorRegularClasses = async () => {
//   try {
//     const res = await api.get('/regular/tutor/students');
//     return res.data; // { success, data }
//   } catch (error) {
//     throw new Error(handleApiError(error));
//   }
// };

/**
 * Update demo booking status (Accept / Reject)
 * Endpoint: PATCH /api/bookings/:id/status
 * @param bookingId - The booking ID
 * @param status - Either "confirmed" or "cancelled"
 */
export const updateDemoRequestStatus = async (
  bookingId: string,
  status: 'confirmed' | 'cancelled'
) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data; // contains { success, message, data }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


export const getTutorRegularClasses = async () => {
  try {
    const res = await api.get("/regular/tutor/regular-classes");
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const scheduleRegularClass = async (
  regularClassId: string,
  payload: { time: string }
) => {
  try {
    const res = await api.post(
      `/regular/tutor/regular-class/${regularClassId}/schedule`,
      payload
    );
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getRegularClassSessions = async (regularClassId: string) => {
  try {
    const res = await api.get(`/regular/${regularClassId}/sessions`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const joinSession = async (sessionId: string) => {
  try {
    const res = await api.post(`/sessions/${sessionId}/join`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

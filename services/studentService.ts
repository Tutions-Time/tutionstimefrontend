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
  tutorId: string | undefined; // allow undefined
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'demo' | 'regular';
  amount?: number;
}) => {
  if (!bookingData.tutorId) throw new Error("Tutor ID is required");
  const response = await api.post('/bookings', bookingData);
  return response.data.data;
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

export const getStudentRegularClasses = async () => {
  try {
    const res = await api.get('/regular/student/regular-classes');
    return res.data?.data || [];
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
export const fetchTutors = async (params?: { subject?: string; teachingMode?: string }) => {
  try {
    const response = await api.get('/tutors/search', { params });
    return response.data; 
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const fetchTutorById = async (id: string) => {
  try {
    const response = await api.get(`/tutors/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getTutorAvailability = async (
  tutorId: string,
  type: "demo" | "regular" = "demo"
) => {
  try {
    const response = await api.get(`/availability/${tutorId}?type=${type}`);
    return response.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getBookingById = async (bookingId: string) => {
  try {
    const res = await api.get('/bookings');
    return res.data?.data?.find((b: any) => b._id === bookingId);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


// Get all tutor demo bookings
export const getTutorBookings = async (params?: { status?: string; type?: string }) => {
  try {
    const res = await api.get('/bookings/tutor', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update booking status (accept / reject)
export const updateBookingStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
  try {
    const res = await api.patch(`/bookings/${id}/status`, { status });
    return res.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};





// Cancel a booking
export const cancelBooking = async (bookingId: string) => {
  try {
    const res = await api.patch(`/bookings/${bookingId}/cancel`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
// Get current user's subscriptions
export const getMySubscriptions = async () => {
  try {
    const res = await api.get(`/subscriptions/my`);
    return res.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Ensure getMyBookings hits the right existing backend route
export const getMyBookings = async () => {
  try {
    const res = await api.get("/bookings/my"); // you added this route
    return res.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const createDemoBooking = async (data: {
  tutorId: string;
  subject: string;
  date: string;
  time?: string;
  note?: string;
}) => {
  try {
    const response = await api.post("/bookings/demo", data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Send enquiry to a tutor
export const sendTutorEnquiry = async (data: {
  tutorId: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await api.post("/enquiries", data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const joinSession = async (sessionId: string) => {
  try {
    const res = await api.post(`/sessions/${sessionId}/join`);
    return res.data; // { success, url }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getSessionAssignments = async (sessionId: string) => {
  try {
    const res = await api.get(`/sessions/${sessionId}/assignments`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getAssignmentDownloadUrls = async (assignmentId: string) => {
  try {
    const res = await api.get(`/sessions/assignments/${assignmentId}/download-urls`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const submitAssignment = async (assignmentId: string, files: File[]) => {
  try {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const res = await api.post(`/sessions/assignments/${assignmentId}/submit`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};





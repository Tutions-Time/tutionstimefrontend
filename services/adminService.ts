import api, { handleApiError } from '../lib/api';

// User Management
// ✅ Corrected version
export const getAllUsers = async (params?: { 
  role?: 'student' | 'tutor' | 'admin';
  status?: 'active' | 'inactive' | 'pending';
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get('admin/users', { params });
    return {
      success: response.data.success,
      users: response.data.data?.users || [],
      pagination: response.data.data?.pagination || {},
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
  try {
    const response = await api.put(`admin/users/${userId}/status`, { status });
    return response.data.user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Subject Management
export const getAllSubjects = async (params?: { page?: number; limit?: number }) => {
  try {
    const response = await api.get('/admin/subjects', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getSubjectById = async (subjectId: string) => {
  try {
    const response = await api.get(`/admin/subjects/${subjectId}`);
    return response.data.subject;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const createSubject = async (subjectData: {
  name: string;
  description: string;
  category: string;
}) => {
  try {
    const response = await api.post('/admin/subjects', subjectData);
    return response.data.subject;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateSubject = async (
  subjectId: string,
  subjectData: {
    name?: string;
    description?: string;
    category?: string;
  }
) => {
  try {
    const response = await api.put(`/admin/subjects/${subjectId}`, subjectData);
    return response.data.subject;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const deleteSubject = async (subjectId: string) => {
  try {
    const response = await api.delete(`/admin/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Booking Management
export const getAllBookings = async (params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.stats;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


export const getAllTutors = async () => {
  try {
    const res = await api.get('/admin/tutors');
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateTutorKyc = async (id: string, kyc: 'approved' | 'rejected' | 'pending') => {
  try {
    const res = await api.put(`/admin/tutors/${id}/kyc`, { kyc });
    return res.data.profile;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateTutorStatus = async (id: string, status: 'active' | 'suspended') => {
  try {
    const res = await api.put(`/admin/tutors/${id}/status`, { status });
    return res.data.user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

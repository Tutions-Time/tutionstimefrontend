import api, { handleApiError } from '../lib/api';

export const updateStudentProfile = async (formData: FormData) => {
  try {
    const response = await api.post('/users/student-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateTutorProfile = async (formData: FormData) => {
  try {
    const response = await api.post('/users/tutor-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
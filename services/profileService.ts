import api, { handleApiError } from '../lib/api';

export const updateStudentProfile = async (formData: FormData) => {
  try {
    const response = await api.post('/users/student-profile', formData, {
    
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateTutorProfile = async (formData: FormData) => {
  try {
    const response = await api.post("/users/tutor-profile", formData, {
      headers: {
        // Let Axios detect boundaries automatically
        Accept: "application/json",
      },
      // Large video uploads can take time; extend timeout and body limits
      timeout: 300000, // 5 minutes
      maxBodyLength: Infinity as any,
      maxContentLength: Infinity as any,
      onUploadProgress: () => {},
    });
    return response.data;
  } catch (error: any) {
    if (error?.code === "ECONNABORTED") {
      throw new Error(
        "Upload timed out. Please try again or use a smaller video file.",
      );
    }
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

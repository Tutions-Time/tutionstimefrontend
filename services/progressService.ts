import api, { handleApiError } from '../lib/api';

export const getStudentProgressSummary = async () => {
  try {
    const res = await api.get('/progress/student/summary');
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getStudentProgressBySubject = async () => {
  try {
    const res = await api.get('/progress/student/by-subject');
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getTutorProgressSummary = async () => {
  try {
    const res = await api.get('/progress/tutor/summary');
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const submitSessionFeedback = async (
  sessionId: string,
  payload: { teaching: number; communication: number; understanding: number; comment?: string }
) => {
  try {
    const res = await api.post(`/progress/sessions/${sessionId}/feedback`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


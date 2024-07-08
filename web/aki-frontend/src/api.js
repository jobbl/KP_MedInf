// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Adjust the URL to match your backend server

// Create the api instance
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token has expired
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User registration
export const registerUser = (username, password) => {
  return api.post('/register/', { username, password });
};

// User login
export const loginUser = (username, password) => {
  return api.post('/login/', { username, password });
};

// User logout
export const logoutUser = () => {
  return api.post('/logout/');
};

// Get patient's details
export const getPatients = () => {
  return api.get('/patients/');
};

export const createPatientFeatureFromFile = (patientId,file) => {
  const formData = new FormData();
  console.log('file',file);
  formData.append('file', file);

  return api.post(`/patients/${patientId}/features/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Upload patients from a CSV file
export const uploadPatients = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload_patients/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Predict based on patient features
export const predictPatient = (patientId) => {
  return api.post(`/predict/${patientId}/`);
};

// Export the api instance if needed elsewhere

export const getLabValues = (patientId) => {
  console.log('getLabValues');
  console.log('patientId',patientId);
  return api.get(`/patients/${patientId}/lab_values/`);
};

export const getPredictions = (patientId) => {
  return api.get(`/patients/${patientId}/predictions/`);
};


export default api;
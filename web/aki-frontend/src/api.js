// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Adjust the URL to match your backend server

// User registration
export const registerUser = (username, password) => {
  return axios.post(`${API_URL}/register/`, { username, password });
};

// User login
export const loginUser = (username, password) => {
  return axios.post(`${API_URL}/login/`, { username, password });
};

// User logout
export const logoutUser = () => {
  return axios.post(`${API_URL}/logout/`);
};

// Get patient's details
export const getPatients = (token) => {
  return axios.get(`${API_URL}/patients/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Create patient feature
export const createPatientFeature = (patientId, data, token) => {
  return axios.post(`${API_URL}/patients/${patientId}/features/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Predict based on patient features
export const predictPatient = (patientId, token) => {
  return axios.post(`${API_URL}/predict/${patientId}/`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

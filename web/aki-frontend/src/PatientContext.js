// src/PatientContext.js

import React, { createContext, useState, useEffect } from 'react';
import { getPatients } from './api'; // Adjust the import path as necessary

export const PatientContext = createContext();

export const PatientProvider = ({ children, token }) => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getPatients(token);
        console.log(response.data);
        setPatients(response.data); // Assuming the API returns the list of patients directly
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        // Handle error appropriately
      }
    };

    if (token) {
      fetchPatients();
    }
  }, [token]); // Dependency array includes token to refetch when it changes

  return (
    <PatientContext.Provider value={patients}>
      {children}
    </PatientContext.Provider>
  );
};
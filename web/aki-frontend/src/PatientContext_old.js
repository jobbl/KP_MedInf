// src/PatientContext.js

import React, { createContext, useState, useEffect } from 'react';
import Papa from 'papaparse';

export const PatientContext = createContext();

export const PatientProvider = ({ children, csvFile }) => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    Papa.parse(csvFile, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: function (results) {
        setPatients(results.data);
      }
    });
  }, [csvFile]);

  return (
    <PatientContext.Provider value={patients}>
      {children}
    </PatientContext.Provider>
  );
};

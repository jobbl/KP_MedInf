import React, { useEffect, useState } from 'react';
import { getPatients } from '../api';

function Home({ user, token, onLogout }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getPatients(token);
        setPatients(response.data);
      } catch (error) {
        alert('Failed to fetch patients');
      }
    };

    fetchPatients();
  }, [token]);

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <button onClick={onLogout}>Logout</button>
      <ul>
        {patients.map(patient => (
          <li key={patient.id}>{patient.patient_id}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
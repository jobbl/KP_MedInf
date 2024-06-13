// src/components/Home.js

import React from 'react';
import PatientTable from './PatientTable';
import Sidebar from './Sidebar';
import { Container, Typography, Box } from '@mui/material';
import './../App.css';

const Home = ({ user }) => {
  const csvFile = '/patients.csv'; // Path to your CSV file

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FFFFFF' }}>
      <Sidebar user={user} />
      <Container sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4 }}>Willkommen</Typography>
          <PatientTable csvFile={csvFile} />
        </Box>
      </Container>
    </div>
  );
};

export default Home;

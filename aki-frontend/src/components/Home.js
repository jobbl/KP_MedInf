import React, { useState } from 'react';
import PatientTable from './PatientTable';
import Sidebar from './Sidebar';
import { Container, Typography, Box, TextField } from '@mui/material';
import './../App.css';

const Home = ({ user }) => {
  const csvFile = '/patients.csv';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FFFFFF' }}>
      <Sidebar user={user} />
      <Container sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4 }}>Willkommen</Typography>
          <TextField
            label="Suche Patienten"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 4 }}
          />
          <PatientTable csvFile={csvFile} searchQuery={searchQuery} />
        </Box>
      </Container>
    </div>
  );
};

export default Home;

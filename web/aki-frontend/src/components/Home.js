import React, { useEffect, useState } from 'react';
import { getPatients, uploadPatients } from '../api';
import { Button, Modal, Box, Typography, TextField, Container } from '@mui/material';
import axios from 'axios';
import Sidebar from './Sidebar';
import PatientTable from './PatientTable';
import './../App.css';

function Home({ user, token, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);


  // Moved fetchPatients outside of useEffect
  const fetchPatients = async () => {
    try {
      const response = await getPatients(token);
      setPatients(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token has expired
        onLogout();
      } else {
        alert('Failed to fetch patients');
      }
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [token, onLogout]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const handleFileUpload = async () => {
    try {
      const response = await uploadPatients(file, token);
      alert('File uploaded successfully');
      handleClose();
      // Fetch updated patients after upload
      await fetchPatients(); // Call fetchPatients again to refresh the list
      setRefreshKey(refreshKey + 1); // Increment refreshKey to force a re-render
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response);
        alert(`File upload failed: ${error.response.data.error}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('File upload failed: No response from server');
      } else {
        console.error('Error message:', error.message);
        alert(`File upload failed: ${error.message}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FFFFFF' }}>
      <Sidebar user={user} onLogout={onLogout} />
      <Container sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4 }}>Willkommen, {user.username}</Typography>
          <TextField
            label="Suche Patienten"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 4 }}
          />
          <PatientTable searchQuery={searchQuery} />
          <Button variant="contained" onClick={handleOpen}>Neue Patienten hinzufügen</Button>
          <Modal open={open} onClose={handleClose}>
            <Box sx={{ ...style, width: 400 }}>
              <Typography variant="h6" component="h2">
                CSV Datei hochladen
              </Typography>
              <input type="file" onChange={handleFileChange} />
              <Button onClick={handleFileUpload}>Hochladen</Button>
            </Box>
          </Modal>
        </Box>
      </Container>
    </div>
  );
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default Home;
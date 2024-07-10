import React, { useEffect, useState } from 'react';
import { getPatients, uploadPatients } from '../api';
import { Button, Modal, Box, Typography, TextField, Container } from '@mui/material';
import Layout from './Layout';
import PatientTable from './PatientTable';

function Home({ user, token, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPatients = async () => {
    try {
      const response = await getPatients(token);
      setPatients(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
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
      await fetchPatients();
      setRefreshKey(refreshKey + 1);
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
    <Layout user={user} onLogout={onLogout}>
      <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 2, alignSelf: 'flex-start' }}>Willkommen, {user.username}</Typography>
        
        <TextField
            label="Suche Patienten"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 0, width: '60%', alignSelf: 'flex-start' }} 
            size="small" 
          />
        <Box sx={{ width: '100%', mt: 0,  }}>
          <PatientTable searchQuery={searchQuery} />
        </Box>
        <Button variant="contained" onClick={handleOpen} sx={{ mt: 2, alignSelf: 'flex-start' }}>Neue Patienten hinzufügen</Button>
        <Modal open={open} onClose={handleClose}>
          <Box sx={{ ...style, width: 400 }}>
            <Typography variant="h6" component="h2">
              CSV Datei hochladen
            </Typography>
            <input type="file" onChange={handleFileChange} />
            <Button onClick={handleFileUpload}>Hochladen</Button>
          </Box>
        </Modal>
      </Container>
    </Layout>
  );
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#ffffff',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default Home;

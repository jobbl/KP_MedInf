import React, { useContext, useState  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, IconButton, Tooltip, Switch, Grid } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PatientContext } from '../PatientContext';
import Sidebar from './Sidebar';
import './PatientDetail.css';
import { createPatientFeatureFromFile } from '../api';

const PatientDetail = ({ user , token}) => {
  const { id } = useParams();
  console.log('id',id);
  const patients = useContext(PatientContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  console.log(patients);
  const patient = patients.find(patient => patient['id_nr'] == id);


  if (!patient) {
    return <Typography variant="h6">Patient not found</Typography>;
  }

  const handleBackClick = () => {
    navigate('/home');
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAddLabValues = async () => {
    if (!file) {
      alert('Please select a CSV file first.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index] ? values[index].trim() : '';
          return obj;
        }, {});
      });
  
      try {
        console.log('patient', patient);
        console.log('data', data);
        const response = await createPatientFeatureFromFile({ data }, user.token);
        console.log('Lab values added successfully:', response.data);
        alert('Lab values uploaded successfully!');
      } catch (error) {
        if (error.response) {
          console.error('Error response:', error.response);
          alert(`Error uploading lab values: ${error.response.data.error}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          alert('Error uploading lab values: No response from server');
        } else {
          console.error('Error message:', error.message);
          alert(`Error uploading lab values: ${error.message}`);
        }
      }
    };
  
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar user={user} />
      <Container className="patient-detail-container">
        <IconButton onClick={handleBackClick} className="back-button">
          <ArrowBackIcon />
        </IconButton>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">{patient.vorname} {patient.nachname}</Typography>
              <Box>
                <Typography variant="body1">{patient.geschlecht}</Typography>
                <Typography variant="body1">ID-Nr: {patient['id-nr']}</Typography>
              </Box>
              <Box>
                <IconButton><NotificationsIcon /></IconButton>
                <IconButton><StarIcon /></IconButton>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
          <Box className="patient-info">
              <Typography variant="body1">Geburtsdatum: {patient.geburtsdatum}</Typography>
              <Typography variant="body1">Aufnahmedatum: {patient.aufnahmedatum}</Typography>
              <Typography variant="body1">Diagnose: {patient.diagnose}</Typography>
              <Box display="flex" gap="1rem">
                <Button variant="contained">Laborwerte</Button>
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" component="span">
                    CSV-Datei auswählen
                  </Button>
                </label>
                <Button variant="contained" onClick={handleAddLabValues}>Neue Laborwerte hinzufügen</Button>
              </Box>
              {file && (
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                  Selected file: {file.name}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="aki-section">
              <Typography variant="h5">AKI Prognosen</Typography>
              <Typography variant="body2">nächste Prognose: 05.06.2024, 13:00</Typography>
              <Box display="flex" gap="1rem">
                <Button variant="contained">neue Prognose</Button>
                <Button variant="contained">manuelle Prognose</Button>
              </Box>
              <Box className="prognosis-overview">
                <Typography variant="body2">Prognosenübersicht</Typography>
                <Box className="prognosis-row">
                  <Typography>45%</Typography>
                  <Typography>Startdatum</Typography>
                  <Typography>Automatisch</Typography>
                </Box>
                <Box className="prognosis-row">
                  <Typography>23%</Typography>
                  <Typography>Startdatum</Typography>
                  <Typography>Manuell</Typography>
                </Box>
              </Box>
              <Box className="comments-section">
                <Typography variant="h6">Kommentare</Typography>
                <Typography variant="body2">Letzte Prognose nachvollziehbar. Empfehle präventive Maßnahmen.</Typography>
                <Typography variant="body2">Professor Lebergut, 29.04.2024, 15:34</Typography>
                <Typography variant="body2">Was halten sie vom Prognoseverlauf?</Typography>
                <Typography variant="body2">Dr Dietrich, 29.04.2024, 11:46</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap="1rem">
                <Switch />
                <Typography>CDSS</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default PatientDetail;
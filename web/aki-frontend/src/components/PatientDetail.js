import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, IconButton, Grid, Switch } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import { PatientContext } from '../PatientContext';
import Layout from './Layout';
import { createPatientFeatureFromFile, predictPatient, getPredictions } from '../api';
import './PatientDetail.css';

const PatientDetail = ({ user, token }) => {
  const { id } = useParams();
  const patients = useContext(PatientContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const patient = patients.find(patient => patient['id_nr'] == id);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await getPredictions(id, token);
        const sortedPredictions = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPredictions(sortedPredictions);
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      }
    };
    fetchPredictions();
  }, [id, token, refreshKey]);

  if (!patient) {
    return <Typography variant="h6">Patient not found</Typography>;
  }

  const handleLabValuesClick = () => {
    navigate(`/patient/${id}/labdetails`, { state: { patient } });
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      try {
        const response = await createPatientFeatureFromFile(id, selectedFile, token);
        alert('Lab values uploaded successfully!');
        setRefreshKey(refreshKey + 1);
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
    }
  };

  const handleAddLabValuesClick = () => {
    const fileInput = document.getElementById('raised-button-file');
    fileInput.click();
  };

  const handleNewPrediction = async () => {
    try {
      const response = await predictPatient(id, token);
      console.log('New prediction:', response);
      setRefreshKey(oldKey => oldKey + 1);
    } catch (error) {
      console.error('Failed to create new prediction:', error);
    }
  };

  return (
    <Layout user={user}>
      <Container className="patient-detail-container" sx={{ mt: 4, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} className="patient-header" sx={{ mr: 3, alignSelf: 'flex-start' }}>
            <Box className="patient-header-left" sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ mr: 10 }}>{patient.vorname} {patient.nachname}</Typography>
              <Typography variant="body1" sx={{ mr: 6 }}>Geschlecht: {patient.geschlecht}</Typography>
              <Typography variant="body1">ID-Nr: {patient['id_nr']}</Typography>
            </Box>
            <Box className="patient-header-icons">
              <IconButton><StarIcon /></IconButton>
              <IconButton><NotificationsIcon /></IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} className="patient-info" sx={{ mb: 2, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
            <Box className="patient-info-content">
              <Typography variant="body1">Geburtsdatum: {patient.geburtsdatum}</Typography>
              <Typography variant="body1">Aufnahmedatum: {patient.aufnahmedatum}</Typography>
              <Typography variant="body1">Diagnose: {patient.diagnose}</Typography>
              
            </Box>
            <Box className="labs-buttons">
              <Button variant="contained" onClick={handleLabValuesClick}>alle Laborwerte anzeigen</Button>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <Button variant="contained" component="span" onClick={handleAddLabValuesClick}>
                Neue Laborwerte hinzufügen
              </Button>
            </Box>
            {/*file && (
              <Typography variant="body2" style={{ marginTop: '10px' }}>
                Selected file: {file.name}
              </Typography>
            )*/}
          </Grid>
          <Grid item xs={12} className="aki-section" sx={{ mb: 2, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
            <Box className="aki-section-header">
              <Typography variant="h5">Aktuelle AKI-Prognose</Typography>
              {/* <Switch />
              <Typography>CDSS</Typography> */}
            </Box>
            <Box className="prognosis-overview">
              <Typography variant="body2">nächste automatische Prognose um 18:00 Uhr</Typography>
              {predictions.map((prediction, index) => (
                <Box className="prognosis-row" key={index}>
                  <Typography>{(prediction.prediction.probability * 100).toFixed(0)}%</Typography>
                  <Typography>{new Date(prediction.timestamp).toLocaleString()}</Typography>
                  <Typography>{prediction.manual ? 'Prognose gestartet von Dr Müller' : 'Automatische Prognose'}</Typography>
                </Box>
              ))}
            </Box>
            <Box className="comments-section">
              {/* <Typography variant="h6">Kommentare</Typography>
              <Box className="comments-list">
                <Typography variant="body2">Letzte Prognose nachvollziehbar. Empfehle präventive Maßnahmen. <br /> Professor Lebergut, 25.04.2024, 15:34</Typography>
                <Typography variant="body2">Was halten sie vom Prognoseverlauf? <br /> Dr Dietrich, 24.04.2024, 11:46</Typography>
              </Box> */}
            </Box>
            <Box className="cdss-switch">
              <Button variant="contained" onClick={handleNewPrediction}>neue Prognose starten</Button>
              <Button variant="contained">Prognose-Verlauf anzeigen</Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default PatientDetail;

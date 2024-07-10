import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, IconButton, Tooltip, Grid, Switch } from '@mui/material'; // Import Switch here
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PatientContext } from '../PatientContext';
import Layout from './Layout';
import { createPatientFeatureFromFile, predictPatient, getPredictions } from '../api';

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

  const handleBackClick = () => {
    navigate('/home');
  };

  const handleLabValuesClick = () => {
    navigate(`/patient/${id}/labdetails`, { state: { patient } });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAddLabValues = async () => {
    if (!file) {
      alert('Please select a CSV file first.');
      return;
    }

    try {
      const response = await createPatientFeatureFromFile(id, file, token);
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
      <IconButton onClick={handleBackClick} className="back-button">
        <ArrowBackIcon />
      </IconButton>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">{patient.vorname} {patient.nachname}</Typography>
            <Box>
              <Typography variant="body1">{patient.geschlecht}</Typography>
              <Typography variant="body1">ID-Nr: {patient['id_nr']}</Typography>
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
              <Button variant="contained" onClick={handleLabValuesClick}>Laborwerte</Button>
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
              <Button variant="contained" onClick={handleNewPrediction}>neue Prognose</Button>
            </Box>
            <Box className="prognosis-overview">
              <Typography variant="body2">Prognosenübersicht</Typography>
              {predictions.map((prediction, index) => (
                <Box className="prognosis-row" key={index}>
                  <Typography>{(prediction.prediction.probability * 100).toFixed(0)}%</Typography>
                  <Typography>{new Date(prediction.timestamp).toLocaleString()}</Typography>
                  <Typography>{prediction.manual ? 'Ja' : 'Nein'}</Typography>
                </Box>
              ))}
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
    </Layout>
  );
};

export default PatientDetail;

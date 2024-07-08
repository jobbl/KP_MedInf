import React, { useContext, useState, useEffect  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, IconButton, Tooltip, Switch, Grid } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PatientContext } from '../PatientContext';
import Sidebar from './Sidebar';
import './PatientDetail.css';
import { createPatientFeatureFromFile, predictPatient, getPredictions } from '../api';

const PatientDetail = ({ user , token}) => {
  const { id } = useParams();
  console.log('id',id);
  const patients = useContext(PatientContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  console.log(patients);
  const patient = patients.find(patient => patient['id_nr'] == id);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        // Directly use the data returned from getPredictions, assuming it's already in JSON format
        const response = await getPredictions(id, token);
        console.log(response.data); // Now accessing the data property of the response
        // Ensure the data property exists and is an array before attempting to sort
        if (Array.isArray(response.data)) {
          const sortedPredictions = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setPredictions(sortedPredictions);
        } else {
          console.error('Unexpected data format:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      }
    };
    fetchPredictions();
  }, [id, token,refreshKey]); // Assuming id and token are dependencies of this effect


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
      // Assuming createPatientFeatureFromFile is modified to accept FormData
      // and your backend is set up to handle 'multipart/form-data'
      const response = await createPatientFeatureFromFile(id, file, user.token);
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

  const handleNewPrediction = async () => {
    try {
      const response = await predictPatient(id, token);
      // Handle the response here. For example, you might want to update the state
      // with the new prediction or show a success message.
      console.log('New prediction:', response);
      // You might want to add some state update or notification here
      setRefreshKey(oldKey => oldKey + 1);
    } catch (error) {
      console.error('Failed to create new prediction:', error);
      // Handle the error, maybe show an error message to the user
    }
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
      </Container>
    </div>
  );
};

export default PatientDetail;
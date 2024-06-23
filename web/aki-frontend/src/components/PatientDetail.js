import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, IconButton, Tooltip, Switch, Grid } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PatientContext } from '../PatientContext';
import Sidebar from './Sidebar';
import './PatientDetail.css';

const PatientDetail = ({ user }) => {
  const { id } = useParams();
  const patients = useContext(PatientContext);
  const navigate = useNavigate();

  const patient = patients.find(patient => patient['ID-Nr'] === id);

  if (!patient) {
    return <Typography variant="h6">Patient not found</Typography>;
  }

  const handleBackClick = () => {
    navigate('/home');
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
              <Typography variant="h4">{patient.Vorname} {patient.Nachname}</Typography>
              <Box>
                <Typography variant="body1">{patient.Geschlecht}</Typography>
                <Typography variant="body1">ID-Nr: {patient['ID-Nr']}</Typography>
              </Box>
              <Box>
                <IconButton><NotificationsIcon /></IconButton>
                <IconButton><StarIcon /></IconButton>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="patient-info">
              <Typography variant="body1">Geburtsdatum: {patient.Geburtsdatum}</Typography>
              <Typography variant="body1">Aufnahmedatum: {patient.Aufnahmedatum}</Typography>
              <Typography variant="body1">Diagnose: {patient.Diagnose}</Typography>
              <Button variant="contained">Laborwerte</Button>
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

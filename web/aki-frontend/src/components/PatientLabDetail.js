import React, { useState, useEffect } from 'react';
import { Typography, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Box, IconButton, Button } from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getLabValues } from '../api';
import Sidebar from '../components/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';

const PatientLabDetail = ({ user, token }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = location.state || {};
  const [labValues, setLabValues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLabValues = async () => {
      try {
        setIsLoading(true);
        const response = await getLabValues(id, token);
        const sortedLabValues = response.data.sort((a, b) => 
          new Date(b.data.charttime) - new Date(a.data.charttime)
        );
        setLabValues(sortedLabValues);
      } catch (error) {
        console.error("Failed to fetch lab values:", error);
        setError("Failed to load lab values. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLabValues();
  }, [id, token]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!patient) {
    return <Typography variant="h6">Patient not found</Typography>;
  }

  if (isLoading) {
    return <Typography variant="h6">Loading lab values...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  const labAttributes = [
    'albumin_mean', 'aniongap_mean', 'bands_mean', 'bicarbonate_mean', 'bilirubin_mean',
    'bun_mean', 'calcium', 'calcium_mean', 'chloride_mean', 'creat', 'creatinine_mean',
    'diasbp_mean', 'glucose_mean_x', 'glucose_mean_y', 'heartrate_mean', 'hematocrit_mean',
    'hemoglobin_mean', 'inr_mean', 'lactate_mean', 'meanbp_mean', 'phosphate_mean',
    'platelet_mean', 'potassium_mean', 'pt_mean', 'ptt_mean', 'resprate_mean',
    'sodium_mean', 'spo2_mean', 'sysbp_mean', 'tempc_mean', 'uo_rt_6hr', 'uo_rt_12hr',
    'uo_rt_24hr', 'uric_acid_mean', 'wbc_mean'
  ];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar user={user} />
      <Container className="patient-lab-detail-container" sx={{ mt: 4, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
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
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Laborwerte</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Chart Time</TableCell>
                    {labAttributes.map((attr) => (
                      <TableCell key={attr}>{attr.replace(/_/g, ' ').toUpperCase()}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labValues.map((labValue) => (
                    <TableRow key={labValue.id}>
                      <TableCell>{new Date(labValue.data.charttime).toLocaleString()}</TableCell>
                      {labAttributes.map((attr) => (
                        <TableCell key={attr}>
                          {labValue.data[attr] ? labValue.data[attr] : 'N/A'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default PatientLabDetail;
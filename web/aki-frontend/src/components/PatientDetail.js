import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, IconButton, Grid, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getLabValues } from '../api';
import Layout from './Layout';
import { createPatientFeatureFromFile, predictPatient, getPredictions, getPatients } from '../api';
import './PatientDetail.css';

const attributeDisplayNames = {
  'albumin_mean': 'Albumin <br /> in g/dL',
  'aniongap_mean': 'Anionenlücke <br /> in mEq/L',
  'bands_mean': 'Granulozyten <br /> in %',
  'bicarbonate_mean': 'Bicarbonat <br /> in mEq/L',
  'bilirubin_mean': 'Bilirubin <br /> in mg/dL',
  'bun_mean': 'Harnstoff <br /> in mg/dL',
  'calcium': 'Calcium <br /> in mg/dL',
  'chloride_mean': 'Chlorid <br /> in mEq/L',
  'creat': 'Kreatinin <br /> in mg/dL',
  'glucose': 'Glukose <br /> in mg/dL',
  'hematocrit_mean': 'Hämatokrit <br /> in %',
  'hemoglobin_mean': 'Hämoglobin <br /> in g/dL',
  'inr_mean': 'INR',
  'lactate_mean': 'Laktat <br /> in mmol/L',
  'phosphate_mean': 'Phosphat <br /> in mg/dL',
  'platelet_mean': 'Thrombozyten <br /> in K/uL',
  'potassium_mean': 'Kalium <br /> in mEq/L',
  'pt_mean': 'PT <br /> in s',
  'ptt_mean': 'PTT <br /> in s',
  'resprate_mean': 'Atemfrequenz <br /> in AZ/min',
  'sodium_mean': 'Natrium <br /> in mEq/L',
  'uric_acid_mean': 'Harnsäure <br /> in mg/dL',
  'wbc_mean': 'Leukozyten <br /> in K/uL',
  'blood_pressure': 'DIAST.RR/SYST.RR <br /> in ',
  'heartrate_mean': 'Herzfrequenz <br /> in ',
  'spo2_mean': 'SPO2 <br /> in ',
  'meanbp_mean': 'MAP <br /> in ',
  'tempc_mean': 'Körpertemperatur <br /> in °C',
  'uo_rt_6hr': 'Urinausfuhrrate über 6h <br /> in ml/kg/h',
  'uo_rt_12hr': 'Urinausfuhrrate über 12h <br /> in ml/kg/h',
  'uo_rt_24hr': 'Urinausfuhrrate über 24h <br /> in ml/kg/h'
};

const PatientDetail = ({ user, token, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [labValues, setLabValues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [labValuesKey, setLabValuesKey] = useState(0);
  const [predictError, setPredictError] = useState(null);

  const patient = patients.find(patient => patient['id_nr'] == id);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await getPatients(token);
        setPatients(response.data);
      } catch (error) {
        console.error('Die Patienten konnten nicht geladen werden:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, [token]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await getPredictions(id, token);
        const sortedPredictions = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPredictions(sortedPredictions);
      } catch (error) {
        console.error('Die Prognosen konnten nicht geladen werden:', error);
      }
    };
    fetchPredictions();
  }, [id, token, refreshKey]);

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
        console.error("Die Laborwerte konnten nicht geladen werden:", error);
        setError("Die Laborwerte konnten nicht geladen werden. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLabValues();
  }, [id, token, labValuesKey]);

  if (isLoading) {
    return <Typography variant="h6">Patient wird geladen...</Typography>;
  }

  if (!patient) {
    return <Typography variant="h6">Der Patient wurde nicht gefunden.</Typography>;
  }

  const handleLabValuesClick = () => {
    navigate(`/patient/${id}/labdetails`, { state: { patient } });
  };

  const handleAddLabValuesClick = () => {
    const fileInput = document.getElementById('raised-button-file');
    fileInput.click();
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      try {
        const response = await createPatientFeatureFromFile(id, selectedFile, token);
        alert('Die Laborwerte wurden erfolgreich hinzugefügt!');
        setLabValuesKey(prev => prev + 1);  
        setRefreshKey(prev => prev + 1);   
      } catch (error) {
        if (error.response) {
          console.error('Error response:', error.response);
          alert(`Beim Hinzufügen der Laborwerte ist ein Fehler aufgetreten: ${error.response.data.error}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          alert('Beim Hinzufügen der Laborwerte ist ein Fehler aufgetreten.');
        } else {
          console.error('Error message:', error.message);
          alert(`Beim Hinzufügen der Laborwerte ist ein Fehler aufgetreten: ${error.message}`);
        }
      }
    }
  };

  const labAttributes = [
    'albumin_mean', 'aniongap_mean', 'bands_mean', 'bicarbonate_mean', 'bilirubin_mean',
    'bun_mean', 'calcium', 'chloride_mean', 'creat',
    'glucose', 'hematocrit_mean',
    'hemoglobin_mean', 'inr_mean', 'lactate_mean', 'phosphate_mean',
    'platelet_mean', 'potassium_mean', 'pt_mean', 'ptt_mean', 'resprate_mean',
    'sodium_mean', 'uric_acid_mean', 'wbc_mean'
  ];

  const vitalAttributes = [
    'blood_pressure', 'heartrate_mean', 'spo2_mean', 'meanbp_mean', 'tempc_mean'
  ]

  const balancingAttributes = [
    'uo_rt_6hr', 'uo_rt_12hr', 'uo_rt_24hr'
  ]

  const handleNewPrediction = async () => {
    try {
      setPredictError(null);
      const response = await predictPatient(id, token);
      console.log('Neue Prognose:', response);
      setRefreshKey(oldKey => oldKey + 1);
    } catch (error) {
      console.error('Fehler beim Erstellen einer neuen Prognose:', error);
      if (error.response && error.response.data.error === "Für diesen Patienten wurden keine Laborwerte gefunden.") {
        setPredictError("Für diesen Patienten wurden keine Laborwerte gefunden.");
      } else {
        setPredictError("Fehler beim Erstellen einer neuen Prognose. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.");
      }
    }
  };

  const isDisabled = labValues.length === 0;

  return ( 
    <Layout user={user} onLogout={onLogout}>
      <Container className="patient-detail-container" sx={{ mt: 4, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} className="patient-header" sx={{ mr: 3, alignSelf: 'flex-start' }}>
            <Box className="patient-header-left" sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ mr: 10 }}>{patient.vorname} {patient.nachname}</Typography>
              <Typography variant="body1" sx={{ mr: 6 }}>Geschlecht: {patient.geschlecht}</Typography>
              <Typography variant="body1">ID-Nr: {patient['id_nr']}</Typography>
            </Box>
            {/* <Box className="patient-header-icons">
              <IconButton><StarIcon /></IconButton>
              <IconButton><NotificationsIcon /></IconButton>
            </Box> */}
          </Grid>

          <Grid item xs={12} className="patient-info" sx={{ mb: 2, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
            <Box className="patient-info-content">
              <Typography variant="body1">Geburtsdatum: {patient.geburtsdatum}</Typography>
              <Typography variant="body1">Aufnahmedatum: {patient.aufnahmedatum}</Typography>
              <Typography variant="body1">Diagnose: {patient.diagnose}</Typography>
            </Box>
            <Box className="labs-buttons">
              {/* <Button variant="contained" onClick={handleLabValuesClick}>alle Laborwerte anzeigen</Button> */}
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

          <Grid className="accordion-grid" sx={{ mb: 2, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
            <Tooltip title={isDisabled ? "Für diesen Patienten liegen noch keine Laborwerte vor." : ""}>
              <span>
                <Accordion item xs={12} className="accordion-container" disabled={isDisabled} sx={{ alignSelf: 'flex-start', backgroundColor: '#f5f5f5'}}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Laborwerte</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="accordion-details" sx={{mr: 3, alignSelf: 'flex-start' }}>
                    {isLoading ? (
                      <Typography variant="h6">Laborwerte werden geladen...</Typography>
                    ) : error ? (
                      <Typography variant="h6" color="error">{error}</Typography>
                    ) : (
                      <TableContainer className="accordion-table-container" component={Paper}>
                        <Table>
                          <TableHead className="table-header-sticky">
                            <TableRow>
                              <TableCell></TableCell>
                              {labValues.map((labValue, index) => (
                                <TableCell key={index}>{new Date(labValue.data.charttime).toLocaleDateString()}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody className="table-first-column-sticky">
                            {labAttributes.map((attr) => (
                              <TableRow key={attr}>
                                <TableCell dangerouslySetInnerHTML={{ __html: attributeDisplayNames[attr] }} />
                                {labValues.map((labValue, index) => (
                                  <TableCell key={index}>
                                    {attr === 'glucose'
                                      ? labValue.data['glucose_mean_x'] || labValue.data['glucose_mean_y']
                                        ? labValue.data['glucose_mean_x'] || labValue.data['glucose_mean_y']
                                        : ''
                                      : (labValue.data[attr] ? labValue.data[attr] : '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              </span>
            </Tooltip>
            <Tooltip title={isDisabled ? "Für diesen Patienten liegen noch keine Laborwerte vor." : ""}>
              <span>
                <Accordion item xs={12} className="accordion-container" disabled={isDisabled} sx={{ alignSelf: 'flex-start', backgroundColor: '#f5f5f5'}}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Vitalwerte</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="accordion-details">
                    {isLoading ? (
                      <Typography variant="h6">Vitalwerte werden geladen...</Typography>
                    ) : error ? (
                      <Typography variant="h6" color="error">{error}</Typography>
                    ) : (
                      <TableContainer className="accordion-table-container" component={Paper}>
                        <Table>
                          <TableHead className="table-header-sticky">
                            <TableRow>
                              <TableCell></TableCell>
                              {labValues.map((labValue, index) => (
                                <TableCell key={index}>{new Date(labValue.data.charttime).toLocaleDateString()}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody className="table-first-column-sticky">
                            {vitalAttributes.map((attr) => (
                              <TableRow key={attr}>
                                <TableCell>{attributeDisplayNames[attr]}</TableCell>
                                {labValues.map((labValue, index) => (
                                  <TableCell key={index}>
                                    {attr === 'blood_pressure'
                                      ? labValue.data['diasbp_mean'] && labValue.data['sysbp_mean']
                                        ? `${labValue.data['diasbp_mean']}/${labValue.data['sysbp_mean']}`
                                        : ''
                                      : (labValue.data[attr] ? labValue.data[attr] : '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              </span>
            </Tooltip>
            <Tooltip title={isDisabled ? "Für diesen Patienten liegen noch keine Laborwerte vor." : ""}>
              <span>
                <Accordion item xs={12} className="accordion-container" disabled={isDisabled} sx={{ alignSelf: 'flex-start', backgroundColor: '#f5f5f5'}}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Bilanzierung</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="accordion-details">
                    {isLoading ? (
                      <Typography variant="h6">Bilanzierungswerte werden geladen...</Typography>
                    ) : error ? (
                      <Typography variant="h6" color="error">{error}</Typography>
                    ) : (
                      <TableContainer className="accordion-table-container" component={Paper}>
                        <Table>
                          <TableHead className="table-header-sticky">
                            <TableRow>
                              <TableCell></TableCell>
                              {labValues.map((labValue, index) => (
                                <TableCell key={index}>{new Date(labValue.data.charttime).toLocaleDateString()}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody className="table-first-column-sticky">
                            {balancingAttributes.map((attr) => (
                              <TableRow key={attr}>
                                <TableCell dangerouslySetInnerHTML={{ __html: attributeDisplayNames[attr] }} />
                                {labValues.map((labValue, index) => (
                                  <TableCell key={index}>
                                    {labValue.data[attr] ? labValue.data[attr] : ''}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              </span>
            </Tooltip>
          </Grid>

          <Grid item xs={12} className="aki-section" sx={{ mb: 2, ml: 3, mr: 3, alignSelf: 'flex-start' }}>
            <Box className="aki-section-header">
              <Typography variant="h5">Aktuelle AKI-Prognose</Typography>
              {/* <Switch />
              <Typography>CDSS</Typography> */}
            </Box>
            <Box className="prognosis-overview">
              {/* <Typography variant="body2">nächste automatische Prognose um 18:00 Uhr</Typography> */}
              {predictions.length === 0 ? (
                <Typography variant="body2" sx={{pb: 3}}>Für diesen Patienten liegen noch keine Prognosen vor.</Typography>
              ) : (
                predictions.map((prediction, index) => (
                  <Box className="prognosis-row" key={index}>
                    <Typography>{(prediction.prediction.probability * 100).toFixed(0)}%</Typography>
                    <Typography>{new Date(prediction.timestamp).toLocaleString()}</Typography>
                    <Typography>{prediction.manual ? 'Prognose gestartet von Dr Müller' : 'Automatische Prognose'}</Typography>
                  </Box>
                ))
              )}
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
              {/* <Button variant="contained" sx={{ml: 2}}>Prognose-Verlauf anzeigen</Button> */}
            </Box>
            {predictError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {predictError}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default PatientDetail;

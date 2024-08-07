import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientTable.css';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Typography, IconButton, Tooltip, TablePagination } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { deletePatient, getPredictions } from '../api'; 

const CustomTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  '& .MuiTableSortLabel-icon': {
    opacity: 1,
    color: '#dde7ed !important'
  },
  '&.Mui-active .MuiTableSortLabel-icon': {
    color: '#497588 !important'
  }
}));

const PatientTable = ({ searchQuery, patients, token }) => {
  const [patientList, setPatientList] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('aki_score');
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  useEffect(() => {
    setPatientList(patients);
  }, [patients]);

  useEffect(() => {
    const fetchPredictions = async () => {
      const patientsWithPredictions = await Promise.all(
        patients.map(async (patient) => {
          try {
            const response = await getPredictions(patient.id_nr, token);
            const predictions = response.data;
            const latestPrediction = predictions.length > 0 
              ? predictions.reduce((latest, current) => 
                  new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
                )
              : null;
            return {
              ...patient,
              aki_score: latestPrediction ? latestPrediction.prediction.probability : ''
            };
          } catch (error) {
            console.error(`Beim Laden der Prognose für den Patienten mit ID-Nr ${patient.id_nr} ist ein Fehler aufgetreten:`, error);
            return { ...patient, aki_score: 'Error' };
          }
        })
      );
      setPatientList(patientsWithPredictions);
    };
    fetchPredictions();
  }, [patients, token]);
  

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (b[orderBy] > a[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  };

  const filteredPatients = patientList.filter(patient =>
    patient.nachname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.vorname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => sortComparator(a, b, orderBy));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowClick = (id) => {
    navigate(`/patient/${id}`);
  };

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      setPatientList(prevList => prevList.filter(patient => patient.id_nr !== id));
    } catch (error) {
      console.error('Beim Löschen des Patienten ist ein Fehler aufgetreten:', error);
    }
  };

  return (
    <Container className="table-container" sx={{paddingLeft: 0 }}>
      <Typography variant="h6">Patientenübersicht</Typography>
      <TableContainer component={Paper} sx={{paddingLeft: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'nachname'}
                  direction={orderBy === 'nachname' ? order : 'asc'}
                  onClick={() => handleRequestSort('nachname')}
                >
                  Nachname
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'vorname'}
                  direction={orderBy === 'vorname' ? order : 'asc'}
                  onClick={() => handleRequestSort('vorname')}
                >
                  Vorname
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">m/w/d</TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'geburtsdatum'}
                  direction={orderBy === 'geburtsdatum' ? order : 'asc'}
                  onClick={() => handleRequestSort('geburtsdatum')}
                >
                  Geb.-Dat.
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'aufnahmedatum'}
                  direction={orderBy === 'aufnahmedatum' ? order : 'asc'}
                  onClick={() => handleRequestSort('aufnahmedatum')}
                >
                  Aufn.-Dat.
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'id_nr'}
                  direction={orderBy === 'id_nr' ? order : 'asc'}
                  onClick={() => handleRequestSort('id_nr')}
                >
                  ID-Nr
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'aki_score'}
                  direction={orderBy === 'aki_score' ? order : 'asc'}
                  onClick={() => handleRequestSort('aki_score')}
                >
                  AKI-Score
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((patient, index) => (
              <TableRow key={index} className="patient-row" onClick={() => handleRowClick(patient.id_nr)} style={{ cursor: 'pointer' }}>
                <TableCell className="table-cell">{patient.nachname}</TableCell>
                <TableCell className="table-cell">{patient.vorname}</TableCell>
                <TableCell className="table-cell">{patient.geschlecht}</TableCell>
                <TableCell className="table-cell">{patient.geburtsdatum}</TableCell>
                <TableCell className="table-cell">{patient.aufnahmedatum}</TableCell>
                <TableCell className="table-cell">{patient.id_nr}</TableCell>
                <TableCell className="table-cell">
                  {typeof patient.aki_score === 'number' 
                    ? `${(patient.aki_score * 100).toFixed(2)}%` 
                    : patient.aki_score}
                </TableCell>
                <TableCell className="patient-actions">
                  <Tooltip title="Patient löschen">
                    <IconButton onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.id_nr); }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[]} 
          component="div"
          count={sortedPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </TableContainer>
    </Container>
  );
};

export default PatientTable;
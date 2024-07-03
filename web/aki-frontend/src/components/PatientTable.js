import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientContext } from '../PatientContext';
import './PatientTable.css';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Typography, IconButton, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

const CustomTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  '& .MuiTableSortLabel-icon': {
    opacity: 1,
    color: '#dde7ed !important'
  },
  '&.Mui-active .MuiTableSortLabel-icon': {
    color: '#497588 !important'
  }
}));

const PatientTable = ({ searchQuery }) => {
  const patients = useContext(PatientContext);
  console.log(patients);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('AKI-Score');
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const navigate = useNavigate();

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

  const filteredPatients = patients.filter(patient =>
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

  return (
    <Container className="table-container">
      <Typography variant="h6">Patientenübersicht</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'Nachname'}
                  direction={orderBy === 'Nachname' ? order : 'asc'}
                  onClick={() => handleRequestSort('Nachname')}
                >
                  Nachname
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'Vorname'}
                  direction={orderBy === 'Vorname' ? order : 'asc'}
                  onClick={() => handleRequestSort('Vorname')}
                >
                  Vorname
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">m/w/d</TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'Geburtsdatum'}
                  direction={orderBy === 'Geburtsdatum' ? order : 'asc'}
                  onClick={() => handleRequestSort('Geburtsdatum')}
                >
                  Geb.-Dat.
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'Aufnahmedatum'}
                  direction={orderBy === 'Aufnahmedatum' ? order : 'asc'}
                  onClick={() => handleRequestSort('Aufnahmedatum')}
                >
                  Aufn.-Dat.
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'ID-Nr'}
                  direction={orderBy === 'ID-Nr' ? order : 'asc'}
                  onClick={() => handleRequestSort('ID-Nr')}
                >
                  ID-Nr
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <CustomTableSortLabel
                  active={orderBy === 'AKI-Score'}
                  direction={orderBy === 'AKI-Score' ? order : 'asc'}
                  onClick={() => handleRequestSort('AKI-Score')}
                >
                  AKI-Score
                </CustomTableSortLabel>
              </TableCell>
              <TableCell className="table-header">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((patient, index) => (
              <TableRow key={index} className="patient-row" onClick={() => handleRowClick(patient['id_nr'])} style={{ cursor: 'pointer' }}>
              <TableCell className="table-cell">{patient.nachname}</TableCell>
              <TableCell className="table-cell">{patient.vorname}</TableCell>
              <TableCell className="table-cell">{patient.geschlecht}</TableCell>
              <TableCell className="table-cell">{patient.geburtsdatum}</TableCell>
              <TableCell className="table-cell">{patient.aufnahmedatum}</TableCell>
              <TableCell className="table-cell">{patient['id_nr']}</TableCell>
              <TableCell className="table-cell">{patient['aki_score']}</TableCell>
              <TableCell className="patient-actions">
                  <Tooltip title="Favorit">
                    <IconButton><StarIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Benachrichtigung">
                    <IconButton><NotificationsIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PatientTable;

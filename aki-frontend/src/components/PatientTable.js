// src/components/PatientTable.js

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientContext } from '../PatientContext';
import './PatientTable.css';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Typography, IconButton, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';

const PatientTable = () => {
  const patients = useContext(PatientContext);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('AKI-Score');
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

  const sortedPatients = [...patients].sort((a, b) => sortComparator(a, b, orderBy));

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
                <TableSortLabel
                  active={orderBy === 'Nachname'}
                  direction={orderBy === 'Nachname' ? order : 'asc'}
                  onClick={() => handleRequestSort('Nachname')}
                >
                  Nachname
                </TableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <TableSortLabel
                  active={orderBy === 'Vorname'}
                  direction={orderBy === 'Vorname' ? order : 'asc'}
                  onClick={() => handleRequestSort('Vorname')}
                >
                  Vorname
                </TableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                m/w/d
              </TableCell>
              <TableCell className="table-header">
                <TableSortLabel
                  active={orderBy === 'Geburtsdatum'}
                  direction={orderBy === 'Geburtsdatum' ? order : 'asc'}
                  onClick={() => handleRequestSort('Geburtsdatum')}
                >
                  Geb.-Dat.
                </TableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <TableSortLabel
                  active={orderBy === 'Aufnahmedatum'}
                  direction={orderBy === 'Aufnahmedatum' ? order : 'asc'}
                  onClick={() => handleRequestSort('Aufnahmedatum')}
                >
                  Aufn.-Dat.
                </TableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <TableSortLabel
                  active={orderBy === 'ID-Nr'}
                  direction={orderBy === 'ID-Nr' ? order : 'asc'}
                  onClick={() => handleRequestSort('ID-Nr')}
                >
                  ID-Nr
                </TableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                <TableSortLabel
                  active={orderBy === 'AKI-Score'}
                  direction={orderBy === 'AKI-Score' ? order : 'asc'}
                  onClick={() => handleRequestSort('AKI-Score')}
                >
                  AKI-Score
                </TableSortLabel>
              </TableCell>
              <TableCell className="table-header">
                Aktionen
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPatients.map((patient, index) => (
              <TableRow key={index} className="patient-row" onClick={() => handleRowClick(patient['ID-Nr'])} style={{ cursor: 'pointer' }}>
                <TableCell className="table-cell">{patient.Nachname}</TableCell>
                <TableCell className="table-cell">{patient.Vorname}</TableCell>
                <TableCell className="table-cell">{patient.Geschlecht}</TableCell>
                <TableCell className="table-cell">{patient.Geburtsdatum}</TableCell>
                <TableCell className="table-cell">{patient.Aufnahmedatum}</TableCell>
                <TableCell className="table-cell">{patient['ID-Nr']}</TableCell>
                <TableCell className="table-cell">{patient['AKI-Score']}</TableCell>
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

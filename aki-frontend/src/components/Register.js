// src/components/Register.js

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import './Register.css';

const Register = ({ onRegister, onClose }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(name, username, password);
    onClose();  // Close the dialog after successful registration
  };

  return (
    <div className="register-container">
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="register-form"
      >
        <Typography variant="h4" component="h1">Neues Benutzerkonto anlegen</Typography>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Passwort"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">Registrieren</Button>
      </Box>
    </div>
  );
};

export default Register;

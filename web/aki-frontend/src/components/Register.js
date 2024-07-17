import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material'; // Import Alert for showing error messages
import './Register.css';

const MIN_USERNAME_LENGTH = 4; // Define minimum length for username
const MIN_PASSWORD_LENGTH = 4; // Define minimum length for password

const Register = ({ onRegister, onClose }) => {
  // const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error message

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check for minimum length requirements
    if (username.length < MIN_USERNAME_LENGTH) {
      setError(`Benutzername muss mindestens ${MIN_USERNAME_LENGTH} Zeichen lang sein.`);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
      return;
    }
    onRegister(null, username, password);
    onClose();  
  };

  return (
    <div className="register-container">
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="register-form"
      >
        <Typography variant="h4" component="h1">Neues Benutzerkonto anlegen</Typography>
        {error && <Alert severity="error">{error}</Alert>} {/* Display error message if any */}
        {/* <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /> */}
        <TextField
          label="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          inputProps={{ minLength: MIN_USERNAME_LENGTH }} // Enforce minimum length in the UI
        />
        <TextField
          label="Passwort"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          inputProps={{ minLength: MIN_PASSWORD_LENGTH }} // Enforce minimum length in the UI
        />
        <Button type="submit" variant="contained" color="primary">Registrieren</Button>
      </Box>
    </div>
  );
};

export default Register;
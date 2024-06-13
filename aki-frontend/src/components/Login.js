// src/components/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Dialog, DialogActions, DialogContent } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import Register from './Register';
import './Login.css';

const Login = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin(username, password)) {
      navigate('/home');
    } else {
      setError('Das eingegebene Passwort ist falsch');
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="login-container">
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="login-form"
      >
        <Typography variant="h4" component="h1">Anmeldung</Typography>
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
        {error && (
          <div className="error-message">
            <WarningIcon />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" variant="contained" color="primary">Einloggen</Button>
        <Typography variant="body2">
          <span onClick={handleClickOpen} style={{color: '#497588', cursor: 'pointer'}}>Neuen Account erstellen</span>
        </Typography>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Register onRegister={onRegister} onClose={handleClose} />
        </DialogContent>
        <DialogActions>
        <Typography variant="body2">
          <span onClick={handleClose} style={{color: '#497588', cursor: 'pointer'}}>Abbrechen</span>
        </Typography>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;

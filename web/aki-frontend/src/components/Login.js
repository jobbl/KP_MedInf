import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import { loginUser, registerUser } from '../api';
import Register from './Register';
import './Login.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const Login = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      onLogin(JSON.parse(storedUser), storedToken);
      navigate('/home');
    }
  }, [navigate, onLogin]);  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(username, password);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user, response.data.token);
      navigate('/home');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (name, newUsername, newPassword) => {
    try {
      await registerUser(newUsername, newPassword);
      setOpen(false);
      alert('Registration successful. Please log in.');
    } catch (error) {
      alert('Registration failed.');
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
          <Register onRegister={handleRegister} onClose={handleClose} />
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
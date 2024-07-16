import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Home from './components/Home.js';
import PatientDetail from './components/PatientDetail.js';
import { PatientProvider } from './PatientContext.js';
import { logoutUser } from './api.js';
import PatientLabDetail from './components/PatientLabDetail';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './App.css';

console.log('App.js');

const theme = createTheme({
  palette: {
    primary: {
      main: '#5e9bb5',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#497588',
          },
        },
      },
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = (loggedInUser, authToken) => {
    setIsLoggedIn(true);
    setUser(loggedInUser);
    setToken(authToken);
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); // If you have a logout API call
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsLoggedIn(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <PatientProvider token={token}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/home" element={isLoggedIn ? <Home user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/patient/:id" element={isLoggedIn ? <PatientDetail user={user} token={token} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/patient/:id/labdetails" element={<PatientLabDetail user={user} token={token}  />} />
        </Routes>
      </Router>
    </PatientProvider>
  );
}

export default App;
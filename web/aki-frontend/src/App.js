import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Home from './components/Home.js';
import PatientDetail from './components/PatientDetail.js';
import { PatientProvider } from './PatientContext.js';
import { logoutUser } from './api.js';

console.log('App.js');

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
        </Routes>
      </Router>
    </PatientProvider>
  );
}

export default App;
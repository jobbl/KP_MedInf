import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login_new';
import Home from './components/Home';
import PatientDetail from './components/PatientDetail';
import { PatientProvider } from './PatientContext';
import Sidebar from './components/Sidebar';
import { logoutUser } from './api.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const csvFile = '/patients.csv'; 

  const handleLogin = (loggedInUser, authToken) => {
    setIsLoggedIn(true);
    setUser(loggedInUser);
    setToken(authToken);
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
  };

  return (
    <PatientProvider csvFile={csvFile}>
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
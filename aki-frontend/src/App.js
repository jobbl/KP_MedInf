import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import PatientDetail from './components/PatientDetail';
import { PatientProvider } from './PatientContext';
import Sidebar from './components/Sidebar';

function App() {
  const [users, setUsers] = useState([
    { name: 'Dr Meier', username: 'thmeier18', password: '1234' },
    { name: 'User', username: 'user', password: 'passwort' },
    { name: 'Test', username: '1', password: '1' }
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const csvFile = '/patients.csv'; 

  const handleLogin = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      setIsLoggedIn(true);
      setLoggedInUser(user);
      return true;
    } else {
      alert('Das eingegebene Passwort ist falsch');
      return false;
    }
  };

  const handleRegister = (name, username, password) => {
    setUsers([...users, { name, username, password }]);
  };

  return (
    <PatientProvider csvFile={csvFile}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} onRegister={handleRegister} />} />
          <Route path="/home" element={isLoggedIn ? <Home user={loggedInUser} /> : <Navigate to="/login" />} />
          <Route path="/patient/:id" element={isLoggedIn ? <PatientDetail user={loggedInUser} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </PatientProvider>
  );
}

export default App;

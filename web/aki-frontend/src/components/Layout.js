import React from 'react';
import { Container, Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children, user, onLogout }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#ffffff' }}> {/* Set background color to white */}
      <Sidebar user={user} onLogout={onLogout} />
      <Container sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;

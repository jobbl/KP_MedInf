import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);  
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: '#dde7ed', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
      }}
    >
      <Box>
        <Toolbar sx={{ backgroundColor: '#dde7ed', justifyContent: 'space-between' }}>
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon sx={{ color: '#000000' }} />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {user ? user.name : 'Benutzer'}
          </Typography>
        </Toolbar>
        {/* <List>
          {['Systemmeldung', 'Systemmeldung', 'Systemmeldung'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
                {index % 2 === 0 ? <NotificationsIcon sx={{ color: '#000000' }} /> : <ErrorIcon sx={{ color: '#000000' }} />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List> */}
      </Box>
      <Box sx={{ mb: 3, px: 2 }}>
        <Button variant="contained" sx={{ backgroundColor: '#5e9bb5', '&:hover': { backgroundColor: '#497588' } }} onClick={onLogout} fullWidth>
          Ausloggen
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

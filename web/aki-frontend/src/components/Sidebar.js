import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';

const Sidebar = ({ user }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: '#dde7ed' },
      }}
    >
      <Toolbar sx={{ backgroundColor: '#dde7ed' }}>
        <Typography variant="h6" noWrap component="div">
          {user ? user.name : 'Benutzer'}
        </Typography>
      </Toolbar>
      <List>
        {['Systemmeldung', 'Systemmeldung', 'Systemmeldung'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index % 2 === 0 ? <NotificationsIcon sx={{ color: '#000000' }} /> : <ErrorIcon sx={{ color: '#000000' }} />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

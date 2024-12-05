import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Home,
  Description,
  Add,
  Search,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';

const DRAWER_WIDTH = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const researcherMenuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'My Documents', icon: <Description />, path: '/protocols' },
    { text: 'Create', icon: <Add />, path: '/protocols/new' },
    { text: 'Search', icon: <Search />, path: '/search' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const adminMenuItems = [
    { text: 'Home', icon: <Home />, path: '/admin' },
    { text: 'User Management', icon: <Person />, path: '/admin/users' },
    { text: 'Documents', icon: <Description />, path: '/admin/protocols' },
    { text: 'Search', icon: <Search />, path: '/admin/search' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : researcherMenuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          mt: '64px',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 
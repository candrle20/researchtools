import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Science,
  Assignment,
  Search,
  People,
  School,
  Settings,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user, isAuthenticated, loading } = auth;

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to RAVA Protocol
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            A platform for managing and sharing research protocols
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ mr: 2 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Admin Dashboard
  if (user?.role === 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 1 }} />
                  <Typography variant="h6">User Management</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Manage users and permissions
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/admin/users')}>
                  Manage Users
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <School sx={{ mr: 1 }} />
                  <Typography variant="h6">Institutions</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Manage research institutions
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/admin/institutions')}>
                  Manage Institutions
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Settings sx={{ mr: 1 }} />
                  <Typography variant="h6">System Settings</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Configure system settings
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/admin/settings')}>
                  Settings
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Researcher Dashboard
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Research Dashboard
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment sx={{ mr: 1 }} />
                <Typography variant="h6">My Protocols</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                View and manage your research protocols
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/research/protocols')}>
                View Protocols
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Science sx={{ mr: 1 }} />
                <Typography variant="h6">Create Protocol</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Start a new research protocol
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/research/protocols/new')}>
                Create New
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Search sx={{ mr: 1 }} />
                <Typography variant="h6">Search</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Find protocols and research materials
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/research/search')}>
                Search Now
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 
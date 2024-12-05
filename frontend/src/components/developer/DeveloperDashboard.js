import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../../utils/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';

const DeveloperDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/users/');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err.response?.data?.detail || 
          err.message || 
          'Failed to fetch dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Authentication required
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Welcome, {user.username}!
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Developer Dashboard
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography>
                  <strong>Role:</strong> {user.user_type}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {data && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  '& pre': {
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }
                }}>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default DeveloperDashboard; 
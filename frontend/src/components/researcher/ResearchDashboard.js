import React from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ResearchDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Welcome, {user?.name || user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Research Dashboard
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Protocols
              </Typography>
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
              <Typography variant="h6" gutterBottom>
                Create Protocol
              </Typography>
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
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>
              <Typography variant="body2" color="textSecondary">
                View and edit your profile information
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/research/profile')}>
                View Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResearchDashboard; 
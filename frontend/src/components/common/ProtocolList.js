import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../auth/AuthContext';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function ProtocolList() {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const response = await api.get('/protocols/');
      setProtocols(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch protocols');
      setLoading(false);
    }
  };

  const handleDeleteProtocol = async (protocolId) => {
    if (window.confirm('Are you sure you want to delete this protocol?')) {
      try {
        await api.delete(`/protocols/${protocolId}/`);
        setProtocols(protocols.filter(p => p.id !== protocolId));
      } catch (err) {
        setError('Failed to delete protocol');
      }
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'DRAFT': 'default',
      'IN_REVIEW': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'error'
    };
    return statusColors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4 
        }}>
          <Typography variant="h4" component="h1">
            My Protocols
          </Typography>
          <Button
            component={Link}
            to="/protocols/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ minWidth: '160px' }}
          >
            Create New
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'grid', 
          gap: 3, 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {protocols.map(protocol => (
            <Card key={protocol.id} elevation={2}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2 
                }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    {protocol.title}
                  </Typography>
                  <Chip
                    label={protocol.status}
                    color={getStatusColor(protocol.status)}
                    size="small"
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: '60px'
                  }}
                >
                  {protocol.description}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  pt: 2
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated: {new Date(protocol.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button
                  component={Link}
                  to={`/protocols/${protocol.id}`}
                  variant="contained"
                  size="small"
                >
                  View Details
                </Button>
                {(user?.is_staff || protocol.status === 'DRAFT') && (
                  <Button
                    onClick={() => handleDeleteProtocol(protocol.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>

        {protocols.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              No protocols found. Create a new one to get started!
            </Typography>
            <Button
              component={Link}
              to="/protocols/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Create Protocol
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ProtocolList; 
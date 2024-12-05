import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ShareProtocol from '../researcher/ShareProtocol';
import api from '../../utils/api';

function ProtocolDetail() {
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchProtocol = useCallback(async () => {
    try {
      const response = await api.get(`/protocols/${id}/`);
      setProtocol(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching protocol:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProtocol();
  }, [fetchProtocol]);

  const handleEdit = () => {
    navigate(`/protocols/edit/${id}`);
  };

  const handleSubmitForReview = async () => {
    setSubmitLoading(true);
    try {
      await api.post(`/protocols/${id}/submit/`);
      await fetchProtocol();
    } catch (error) {
      console.error('Error submitting protocol for review:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'DRAFT': 'default',
      'IN_REVIEW': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'error'
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'DRAFT': 'Draft',
      'IN_REVIEW': 'In Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!protocol) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Protocol not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 3 
        }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {protocol.title}
            </Typography>
            <Chip
              label={getStatusLabel(protocol.status)}
              color={getStatusColor(protocol.status)}
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {protocol.status === 'DRAFT' && (
              <Button
                variant="contained"
                onClick={handleSubmitForReview}
                disabled={submitLoading}
              >
                {submitLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <ShareProtocol protocol={protocol} onShare={fetchProtocol} />
          </Box>
        </Box>

        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Typography variant="body2">
                <strong>Status:</strong> {getStatusLabel(protocol.status)}
              </Typography>
              <Typography variant="body2">
                <strong>Researcher:</strong> {protocol.researcher_name}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(protocol.created_at).toLocaleDateString()}
              </Typography>
              {protocol.submitted_at && (
                <Typography variant="body2">
                  <strong>Submitted:</strong> {new Date(protocol.submitted_at).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {protocol.description}
          </Typography>
        </Box>

        {protocol.file && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Protocol File
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              href={protocol.file}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Protocol
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ProtocolDetail; 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import api from '../../utils/api';

function AdminDashboard() {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [activeView, setActiveView] = useState('new');
  const [reviewForm, setReviewForm] = useState({
    comments: '',
    showForm: false
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    new_submissions: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [protocolsRes, statsRes] = await Promise.all([
          api.get('/protocols/', {
            params: { 
              filter: activeView === 'new' ? 'new_submissions' : 
                     activeView === 'review' ? 'in_review' :
                     activeView === 'approved' ? 'approved' : 'rejected'
            }
          }),
          api.get('/protocols/stats/')
        ]);
        setProtocols(protocolsRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeView]);

  const handleSendToReview = async (protocolId) => {
    try {
      await api.post(`/protocols/${protocolId}/acknowledge/`);
      setSelectedProtocol(null);
      setProtocols(prevProtocols => 
        prevProtocols.map(protocol => 
          protocol.id === protocolId 
            ? { ...protocol, is_new_submission: false }
            : protocol
        )
      );
      const statsRes = await api.get('/protocols/stats/');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error sending protocol to review:', error);
    }
  };

  const handleSubmitReview = async (protocolId, decision) => {
    try {
      if (!reviewForm.comments.trim()) {
        alert('Please add comments before submitting the review');
        return;
      }

      await api.post(`/protocols/${protocolId}/reviews/`, {
        decision: decision,
        comments: reviewForm.comments
      });

      const [protocolsRes, statsRes] = await Promise.all([
        api.get('/protocols/', {
          params: { 
            filter: activeView === 'new' ? 'new_submissions' : 'in_review'
          }
        }),
        api.get('/protocols/stats/')
      ]);

      setProtocols(protocolsRes.data);
      setStats(statsRes.data);
      setReviewForm({ comments: '', showForm: false });
      setSelectedProtocol(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // const getStatusColor = (status) => {
  //   const statusMap = {
  //     'new': 'info',
  //     'review': 'warning',
  //     'approved': 'success',
  //     'rejected': 'error'
  //   };
  //   return statusMap[status] || 'default';
  // };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Protocol Review
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { view: 'new', label: 'New Submissions', value: stats.new_submissions },
            { view: 'review', label: 'In Review', value: stats.pending },
            { view: 'approved', label: 'Approved', value: stats.approved },
            { view: 'rejected', label: 'Rejected', value: stats.rejected }
          ].map(({ view, label, value }) => (
            <Grid item xs={12} sm={6} md={3} key={view}>
              <Card 
                elevation={activeView === view ? 3 : 1}
                onClick={() => setActiveView(view)}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-2px)' },
                  bgcolor: activeView === view ? 'primary.light' : 'background.paper'
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {label}
                  </Typography>
                  <Typography variant="h3" color="text.secondary">
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" gutterBottom>
          {activeView === 'new' ? 'New Submissions' : 
           activeView === 'review' ? 'In Review' :
           activeView === 'approved' ? 'Approved Protocols' : 'Rejected Protocols'}
        </Typography>

        {protocols.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No protocols found in this category
          </Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            {protocols.map(protocol => (
              <Card key={protocol.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {protocol.title}
                      </Typography>
                      {protocol.is_new_submission && (
                        <Chip 
                          label={`ID: ${protocol.id}`}
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={selectedProtocol?.id === protocol.id ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      onClick={() => setSelectedProtocol(selectedProtocol?.id === protocol.id ? null : protocol)}
                    >
                      {selectedProtocol?.id === protocol.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Researcher:</strong> {protocol.researcher_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Submitted:</strong> {formatDateTime(protocol.submitted_at)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedProtocol?.id === protocol.id && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Protocol Details
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {protocol.description}
                      </Typography>

                      {protocol.file && (
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          href={protocol.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mt: 1, mb: 2 }}
                        >
                          View Document
                        </Button>
                      )}

                      {(activeView === 'new' || activeView === 'review') && (
                        <Box sx={{ mt: 3 }}>
                          {protocol.is_new_submission ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleSendToReview(protocol.id)}
                            >
                              Send to Review
                            </Button>
                          ) : (
                            <Box>
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                label="Review Comments"
                                value={reviewForm.comments}
                                onChange={(e) => setReviewForm({ 
                                  ...reviewForm, 
                                  comments: e.target.value 
                                })}
                                required
                                sx={{ mb: 2 }}
                              />
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => handleSubmitReview(protocol.id, 'APPROVED')}
                                  disabled={!reviewForm.comments.trim()}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  startIcon={<CancelIcon />}
                                  onClick={() => handleSubmitReview(protocol.id, 'REJECTED')}
                                  disabled={!reviewForm.comments.trim()}
                                >
                                  Reject
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default AdminDashboard; 
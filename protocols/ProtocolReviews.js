import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import api from '../../utils/api';

function ProtocolReviews({ protocolId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ decision: '', comments: '' });
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/protocols/${protocolId}/reviews/`);
      setReviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  }, [protocolId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/protocols/${protocolId}/reviews/`, newReview);
      setNewReview({ decision: '', comments: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" p={3}>
      <CircularProgress />
    </Box>
  );

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reviews
      </Typography>
      
      {isAdmin && (
        <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="decision-label">Decision</InputLabel>
            <Select
              labelId="decision-label"
              value={newReview.decision}
              label="Decision"
              onChange={(e) => setNewReview(prev => ({
                ...prev,
                decision: e.target.value
              }))}
              required
            >
              <MenuItem value="">Select Decision</MenuItem>
              <MenuItem value="APPROVED">Approve</MenuItem>
              <MenuItem value="REJECTED">Reject</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            value={newReview.comments}
            onChange={(e) => setNewReview(prev => ({
              ...prev,
              comments: e.target.value
            }))}
            required
            sx={{ mb: 2 }}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
          >
            Submit Review
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        {reviews.map(review => (
          <Card key={review.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" color="primary">
                  {review.decision}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(review.review_date).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {review.comments}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Reviewed by: {review.reviewer_name}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
}

export default ProtocolReviews; 
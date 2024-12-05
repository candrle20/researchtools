import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, CircularProgress,
  Card, CardContent, CardActions, Button, Chip, Alert
} from '@mui/material';
import api from '../../utils/api';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchType = searchParams.get('type');
  const query = searchParams.get('q');

  const fetchResults = useCallback(async () => {
    try {
      const response = await api.get('/protocols/search/', {
        params: { type: searchType, q: query }
      });
      setResults(response.data);
    } catch (error) {
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  }, [searchType, query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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
        <Typography variant="h4" gutterBottom>
          Search Results
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Found {results.length} results for "{query}"
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {results.map(protocol => (
            <Card key={protocol.id} elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    {protocol.title}
                  </Typography>
                  <Chip 
                    label={protocol.status}
                    color={protocol.status === 'APPROVED' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {protocol.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption">
                    By: {protocol.researcher_name}
                  </Typography>
                  <Typography variant="caption">
                    Downloads: {protocol.download_count}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  component={Link} 
                  to={`/protocols/${protocol.id}`}
                  size="small" 
                  color="primary"
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        {results.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              No protocols found matching your search criteria.
            </Typography>
            <Button 
              component={Link} 
              to="/search" 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              Back to Search
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default SearchResults; 
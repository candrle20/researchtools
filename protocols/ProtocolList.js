import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, CircularProgress } from '@mui/material';
import ProtocolCard from './ProtocolCard';
import api from '../../utils/api';

function ProtocolList({ filter = 'all' }) {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProtocols = useCallback(async () => {
    try {
      const response = await api.get('/protocols/', {
        params: { filter }
      });
      setProtocols(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching protocols:', error);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {protocols.map(protocol => (
        <Grid item xs={12} sm={6} md={4} key={protocol.id}>
          <ProtocolCard 
            protocol={protocol}
            onUpdate={fetchProtocols}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default ProtocolList; 
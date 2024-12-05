import React from 'react';
import { Box, ButtonGroup, Button, Typography, Paper } from '@mui/material';

function ProtocolFilter({ currentFilter, onFilterChange }) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Filter Protocols
      </Typography>
      <Box>
        <ButtonGroup variant="outlined" aria-label="protocol filter options">
          <Button 
            onClick={() => onFilterChange('all')}
            variant={currentFilter === 'all' ? 'contained' : 'outlined'}
          >
            All Protocols
          </Button>
          <Button 
            onClick={() => onFilterChange('mine')}
            variant={currentFilter === 'mine' ? 'contained' : 'outlined'}
          >
            My Protocols
          </Button>
          <Button 
            onClick={() => onFilterChange('shared')}
            variant={currentFilter === 'shared' ? 'contained' : 'outlined'}
          >
            Shared With Me
          </Button>
          <Button 
            onClick={() => onFilterChange('drafts')}
            variant={currentFilter === 'drafts' ? 'contained' : 'outlined'}
          >
            Drafts
          </Button>
          <Button 
            onClick={() => onFilterChange('approved')}
            variant={currentFilter === 'approved' ? 'contained' : 'outlined'}
          >
            Approved
          </Button>
          <Button 
            onClick={() => onFilterChange('pending')}
            variant={currentFilter === 'pending' ? 'contained' : 'outlined'}
          >
            Pending Review
          </Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );
}

export default ProtocolFilter; 
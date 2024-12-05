import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/results?q=${encodeURIComponent(searchTerm)}&type=all`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Search Protocols
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search protocols by title, description, or researcher..."
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px 0 0 4px'
                }
              }}
            />
            <Button 
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              sx={{ 
                minWidth: '120px',
                borderRadius: '0 4px 4px 0'
              }}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Search; 
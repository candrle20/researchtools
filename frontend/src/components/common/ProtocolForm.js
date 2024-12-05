import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Input
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../utils/api';

function ProtocolForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    status: 'DRAFT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchProtocol = useCallback(async () => {
    try {
      const response = await api.get(`/protocols/${id}/`);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        file: response.data.file,
        status: response.data.status
      });
    } catch (error) {
      setError('Failed to fetch protocol details');
      console.error('Error fetching protocol:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProtocol();
    }
  }, [id, fetchProtocol]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        if (key === 'file' && formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else if (key !== 'file') {
          data.append(key, formData[key]);
        }
      }
    });

    try {
      if (id) {
        await api.put(`/protocols/${id}/`, data);
      } else {
        await api.post('/protocols/', data);
      }
      navigate('/protocols');
    } catch (error) {
      setError('Failed to save protocol. Please try again.');
      console.error('Error saving protocol:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files?.length > 0) {
      setFormData(prev => ({
        ...prev,
        file: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Protocol' : 'New Protocol'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={6}
            margin="normal"
            variant="outlined"
          />

          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Protocol File
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1 }}
            >
              Upload File
              <Input
                type="file"
                name="file"
                onChange={handleChange}
                accept=".pdf,.doc,.docx"
                sx={{ display: 'none' }}
              />
            </Button>
            {formData.file && typeof formData.file === 'string' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Current file: {formData.file.split('/').pop()}
              </Typography>
            )}
            {formData.file instanceof File && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selected file: {formData.file.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: 2,
            mt: 4 
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/protocols')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {id ? 'Update Protocol' : 'Create Protocol'}
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProtocolForm; 
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const InstitutionManagement = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions/');
      setInstitutions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch institutions. Please try again.');
      console.error('Error fetching institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (institution = null) => {
    if (institution) {
      setSelectedInstitution(institution);
      setFormData({
        name: institution.name,
        code: institution.code,
        description: institution.description || '',
        website: institution.website || '',
      });
    } else {
      setSelectedInstitution(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        website: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInstitution(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      website: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (selectedInstitution) {
        await api.put(`/institutions/${selectedInstitution.id}/`, formData);
      } else {
        await api.post('/institutions/', formData);
      }
      
      handleCloseDialog();
      fetchInstitutions();
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Failed to save institution. Please check your input.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (institution) => {
    if (window.confirm(`Are you sure you want to delete ${institution.name}?`)) {
      try {
        await api.delete(`/institutions/${institution.id}/`);
        fetchInstitutions();
      } catch (err) {
        setError(
          err.response?.data?.detail || 
          'Failed to delete institution.'
        );
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" color="primary">Institution Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          Add Institution
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableCell><Typography fontWeight="bold">Name</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Code</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Description</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Website</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {institutions.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>{institution.name}</TableCell>
                <TableCell>{institution.code}</TableCell>
                <TableCell>{institution.description}</TableCell>
                <TableCell>
                  {institution.website && (
                    <a href={institution.website} target="_blank" rel="noopener noreferrer">
                      {institution.website}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(institution)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(institution)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedInstitution ? 'Edit Institution' : 'Add Institution'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Code"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              margin="normal"
              required
              helperText="A unique identifier for the institution"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              margin="normal"
              helperText="Institution's website URL"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstitutionManagement; 
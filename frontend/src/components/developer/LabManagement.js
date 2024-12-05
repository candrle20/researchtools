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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';

const LabManagement = () => {
  const [labs, setLabs] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    institution_id: '',
    contact_email: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchLabs();
    fetchInstitutions();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await api.get('/api/v1/labs/');
      console.log('Fetched labs:', response.data);
      setLabs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching labs:', err.response || err);
      setError('Failed to fetch labs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/api/v1/institutions/');
      console.log('Fetched institutions:', response.data);
      setInstitutions(response.data);
    } catch (err) {
      console.error('Error fetching institutions:', err.response || err);
      setError('Failed to fetch institutions. Please try again.');
    }
  };

  const handleOpenDialog = (lab = null) => {
    if (lab) {
      setSelectedLab(lab);
      setFormData({
        name: lab.name,
        description: lab.description || '',
        institution_id: lab.institution?.id || '',
        contact_email: lab.contact_email || '',
        status: lab.status || 'active',
      });
    } else {
      setSelectedLab(null);
      setFormData({
        name: '',
        description: '',
        institution_id: '',
        contact_email: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLab(null);
    setFormData({
      name: '',
      description: '',
      institution_id: '',
      contact_email: '',
      status: 'active',
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name || !formData.institution_id) {
      setError('Name and Institution are required fields');
      return false;
    }
    if (formData.contact_email && !formData.contact_email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    const submitData = {
      name: formData.name,
      description: formData.description,
      institution_id: parseInt(formData.institution_id, 10),
      contact_email: formData.contact_email,
      status: formData.status,
    };

    try {
      console.log('Submitting lab data:', submitData);
      if (selectedLab) {
        await api.put(`/api/v1/labs/${selectedLab.id}/`, submitData);
      } else {
        await api.post('/api/v1/labs/', submitData);
      }
      await fetchLabs();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving lab:', err.response || err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to save lab. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (labId) => {
    if (window.confirm('Are you sure you want to delete this lab? This action cannot be undone.')) {
      setError(null);
      try {
        await api.delete(`/api/v1/labs/${labId}/`);
        await fetchLabs();
      } catch (err) {
        console.error('Error deleting lab:', err.response || err);
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to delete lab'
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
        <Typography variant="h4" color="primary">Lab Management</Typography>
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
          Add Lab
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
              <TableCell><Typography fontWeight="bold">Institution</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Contact</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary">
                    No labs found. Click "Add Lab" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              labs.map((lab) => (
                <TableRow key={lab.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScienceIcon color="primary" />
                      <Typography>{lab.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{lab.institution?.name || 'N/A'}</TableCell>
                  <TableCell>{lab.contact_email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={lab.status}
                      color={lab.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Lab">
                      <IconButton
                        onClick={() => handleOpenDialog(lab)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Lab">
                      <IconButton
                        onClick={() => handleDelete(lab.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
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
          {selectedLab ? 'Edit Lab' : 'Add Lab'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Lab Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Institution</InputLabel>
              <Select
                name="institution_id"
                value={formData.institution_id}
                onChange={handleInputChange}
                label="Institution"
              >
                {institutions.map((institution) => (
                  <MenuItem key={institution.id} value={institution.id}>
                    {institution.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Contact Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleInputChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} />
            ) : selectedLab ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabManagement; 
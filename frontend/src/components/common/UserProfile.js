import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const ProfileForm = ({ formData, handleInputChange, handleSubmit, setIsEditing, institutions }) => (
  <Box component="form" onSubmit={handleSubmit} noValidate>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          variant="outlined"
          disabled
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="institution-label">Institution</InputLabel>
          <Select
            labelId="institution-label"
            label="Institution"
            name="institution"
            value={formData.institution || ''}
            onChange={(e) => {
              const selectedInstitution = institutions.find(inst => inst.id === e.target.value);
              handleInputChange({
                target: {
                  name: 'institution',
                  value: e.target.value
                }
              });
              handleInputChange({
                target: {
                  name: 'institution_name',
                  value: selectedInstitution?.name || ''
                }
              });
            }}
          >
            <MenuItem value="">
              <em>Select an Institution</em>
            </MenuItem>
            {institutions.map((inst) => (
              <MenuItem key={inst.id} value={inst.id}>
                {inst.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Bio"
          name="bio"
          value={formData.bio || ''}
          onChange={handleInputChange}
          multiline
          rows={4}
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="ORCID ID"
          name="orcid"
          value={formData.orcid || ''}
          onChange={handleInputChange}
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Office Location"
          name="office_location"
          value={formData.office_location || ''}
          onChange={handleInputChange}
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setIsEditing(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

const ProfileView = ({ formData, setIsEditing }) => (
  <Box>
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 4 
    }}>
      <Typography variant="h5" color="primary">
        Profile Information
      </Typography>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={() => setIsEditing(true)}
      >
        Edit Profile
      </Button>
    </Box>
    
    <Grid container spacing={3}>
      {[
        { label: 'Name', value: formData.name },
        { label: 'Email', value: formData.email },
        { label: 'Institution', value: formData.institution_name },
        { label: 'Bio', value: formData.bio },
        { label: 'ORCID ID', value: formData.orcid },
        { label: 'Phone', value: formData.phone },
        { label: 'Office Location', value: formData.office_location }
      ].map(({ label, value }) => (
        <Grid item xs={12} sm={6} key={label}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="body1">
              {value || 'Not provided'}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);

function UserProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    institution_name: '',
    bio: '',
    orcid: '',
    phone: '',
    office_location: ''
  });
  const [institutions, setInstitutions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch institutions
        const institutionsRes = await api.get('/institutions/');
        setInstitutions(institutionsRes.data);

        // Then fetch profile data
        const profileRes = await api.get('/users/profile/');
        if (profileRes.data) {
          setFormData({
            ...profileRes.data,
            institution: profileRes.data.institution || '',
            institution_name: profileRes.data.institution_details?.name || ''
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const submitData = {
      name: formData.name,
      institution: formData.institution || null,
      bio: formData.bio,
      orcid: formData.orcid,
      phone: formData.phone,
      office_location: formData.office_location
    };
    
    try {
      const response = await api.put('/users/profile/', submitData);
      setFormData({
        ...response.data,
        institution: response.data.institution || '',
        institution_name: response.data.institution_details?.name || ''
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.detail || 'Failed to update profile. Please check your input.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          
          {isEditing ? (
            <ProfileForm 
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              setIsEditing={setIsEditing}
              institutions={institutions}
            />
          ) : (
            <ProfileView 
              formData={formData}
              setIsEditing={setIsEditing}
            />
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

export default UserProfile; 
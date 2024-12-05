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
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const USER_TYPES = {
  developer: { 
    label: 'Developer', 
    color: 'error',
    description: 'Full access to all portals (Developer, Research, and Admin)'
  },
  school_admin: { 
    label: 'School Admin', 
    color: 'primary',
    description: 'Access to Admin portal only'
  },
  researcher: { 
    label: 'Researcher', 
    color: 'success',
    description: 'Access to Research portal only'
  },
};

const INITIAL_FORM_STATE = {
  username: '',
  email: '',
  user_type: '',
  password: '',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username || '',
        email: user.email || '',
        user_type: user.user_type || '',
        password: '',
      });
    } else {
      setSelectedUser(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData(INITIAL_FORM_STATE);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.user_type || !formData.username) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (!selectedUser && (!formData.password || !formData.password.trim())) {
      setError('Password is required for new users.');
      return false;
    }
    if (formData.password && formData.password.trim().length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError(null);
    setSubmitting(true);

    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        user_type: formData.user_type,
      };

      if (formData.password && formData.password.trim()) {
        userData.password = formData.password.trim();
      }

      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}/`, userData);
      } else {
        await api.post('/users/', userData);
      }
      await fetchUsers();
      handleCloseDialog();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to save user. Please try again.';
      setError(errorMessage);
      console.error('Error saving user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setError(null);
      try {
        await api.delete(`/users/${userId}/`);
        await fetchUsers();
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
                            err.response?.data?.message ||
                            'Failed to delete user. Please try again.';
        setError(errorMessage);
        console.error('Error deleting user:', err);
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
        <Typography variant="h4" color="primary">User Management</Typography>
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
          Add User
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
              <TableCell><Typography fontWeight="bold">Username</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">User Type</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="textSecondary">
                    No users found. Click "Add User" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={USER_TYPES[user.user_type]?.label || user.user_type}
                      color={USER_TYPES[user.user_type]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit User">
                      <IconButton 
                        onClick={() => handleOpenDialog(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton 
                        onClick={() => handleDelete(user.id)}
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
          {selectedUser ? 'Edit User' : 'Add User'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="User Type"
              name="user_type"
              value={formData.user_type}
              onChange={handleInputChange}
              margin="normal"
              required
              helperText="Select user type - Developer accounts have access to all portals"
            >
              {Object.entries(USER_TYPES).map(([value, { label, description }]) => (
                <MenuItem key={value} value={value}>
                  <Box>
                    <Typography>{label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required={!selectedUser}
              helperText={selectedUser ? 'Leave blank to keep current password' : 'Password must be at least 6 characters'}
            />
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
            ) : selectedUser ? (
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

export default UserManagement; 
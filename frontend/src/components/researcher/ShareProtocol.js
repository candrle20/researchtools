import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import api from '../../utils/api';

function ShareProtocol({ protocol, onShare }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post(`/protocols/${protocol.id}/share/`, {
        email: email
      });
      setOpen(false);
      setEmail('');
      if (onShare) onShare();
    } catch (error) {
      setError('Failed to share protocol. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={() => setOpen(true)}
      >
        Share Protocol
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Protocol</DialogTitle>
        <form onSubmit={handleShare}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                Share
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
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default ShareProtocol; 
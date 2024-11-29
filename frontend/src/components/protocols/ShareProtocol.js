import React, { useState } from 'react';
import api from '../../utils/api';

function ShareProtocol({ protocol, onShare }) {
  const [showModal, setShowModal] = useState(false);
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
      setShowModal(false);
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
      <button 
        className="btn btn-secondary"
        onClick={() => setShowModal(true)}
      >
        Share Protocol
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Share Protocol</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleShare}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ShareProtocol; 
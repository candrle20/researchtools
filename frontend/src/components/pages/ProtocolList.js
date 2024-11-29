import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function ProtocolList() {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const response = await api.get('/protocols/');
      setProtocols(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch protocols');
      setLoading(false);
    }
  };

  const handleDeleteProtocol = async (protocolId) => {
    if (window.confirm('Are you sure you want to delete this protocol?')) {
      try {
        await api.delete(`/protocols/${protocolId}/`);
        setProtocols(protocols.filter(p => p.id !== protocolId));
      } catch (err) {
        setError('Failed to delete protocol');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="protocol-list-container">
      <div className="protocol-list-header">
        <h2>My Protocols</h2>
        <Link to="/protocols/new" className="btn btn-primary">
          Create New Protocol
        </Link>
      </div>

      <div className="protocol-grid">
        {protocols.length === 0 ? (
          <div className="no-protocols">
            <p>No protocols found. Create a new one to get started!</p>
          </div>
        ) : (
          protocols.map(protocol => (
            <div key={protocol.id} className="protocol-card">
              <div className="protocol-card-header">
                <span className={`protocol-status status-${protocol.status.toLowerCase()}`}>
                  {protocol.status}
                </span>
                <h3 className="protocol-title">{protocol.title}</h3>
              </div>
              <div className="protocol-content">
                <p className="protocol-description">{protocol.description}</p>
                <div className="protocol-meta">
                  <div className="meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">
                      {new Date(protocol.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Last Updated:</span>
                    <span className="meta-value">
                      {new Date(protocol.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="protocol-actions">
                <Link 
                  to={`/protocols/${protocol.id}`}
                  className="btn btn-primary view-details-btn"
                >
                  View Details
                </Link>
                {user?.is_staff && (
                  <button
                    onClick={() => handleDeleteProtocol(protocol.id)}
                    className="btn btn-danger delete-btn"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProtocolList; 
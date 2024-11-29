import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShareProtocol from '../protocols/ShareProtocol';
import api from '../../utils/api';

function ProtocolDetail() {
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchProtocol = useCallback(async () => {
    try {
      const response = await api.get(`/protocols/${id}/`);
      setProtocol(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching protocol:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProtocol();
  }, [fetchProtocol]);

  const handleEdit = () => {
    navigate(`/protocols/edit/${id}`);
  };

  const handleSubmitForReview = async () => {
    setSubmitLoading(true);
    try {
      await api.post(`/protocols/${id}/submit/`);
      await fetchProtocol(); // Refresh the protocol data
    } catch (error) {
      console.error('Error submitting protocol for review:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!protocol) return <div>Protocol not found</div>;

  return (
    <div className="protocol-detail">
      <div className="protocol-header">
        <div className="protocol-title-section">
          <h2>{protocol.title}</h2>
          <span className={`protocol-status status-${protocol.status.toLowerCase()}`}>
            {protocol.status === 'IN_REVIEW' ? 'In Review' : protocol.status}
          </span>
        </div>
        <div className="protocol-actions-group">
          {protocol.status === 'DRAFT' && (
            <button 
              onClick={handleSubmitForReview}
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          <button 
            className="btn btn-secondary"
            onClick={handleEdit}
          >
            Edit
          </button>
          <ShareProtocol protocol={protocol} onShare={fetchProtocol} />
        </div>
      </div>
      
      <div className="protocol-info">
        <p><strong>Status:</strong> {protocol.status === 'IN_REVIEW' ? 'In Review' : protocol.status}</p>
        <p><strong>Researcher:</strong> {protocol.researcher_name}</p>
        <p><strong>Created:</strong> {new Date(protocol.created_at).toLocaleDateString()}</p>
        {protocol.submitted_at && (
          <p><strong>Submitted:</strong> {new Date(protocol.submitted_at).toLocaleDateString()}</p>
        )}
      </div>

      <div className="protocol-content">
        <h3>Description</h3>
        <p>{protocol.description}</p>
        
        {protocol.file && (
          <div className="protocol-file">
            <h3>Protocol File</h3>
            <a href={protocol.file} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Download Protocol
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtocolDetail; 
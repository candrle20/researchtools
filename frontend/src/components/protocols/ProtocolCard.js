import React from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

function ProtocolCard({ protocol, onUpdate }) {
  const isResearcher = localStorage.getItem('userRole') === 'researcher';
  const isOwnProtocol = protocol.researcher === localStorage.getItem('username');

  const getStatusClass = (status) => {
    const statusMap = {
      'DRAFT': 'status-draft',
      'IN_REVIEW': 'status-submitted',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected'
    };
    return statusMap[status] || 'status-draft';
  };

  const getStatusDisplay = (status) => {
    const displayMap = {
      'DRAFT': 'Draft',
      'IN_REVIEW': 'In Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected'
    };
    return displayMap[status] || status;
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this protocol?')) {
      try {
        await api.delete(`/protocols/${protocol.id}/`);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting protocol:', error);
      }
    }
  };

  return (
    <div className="protocol-card">
      <div className="protocol-card-header">
        <span className={`protocol-status ${getStatusClass(protocol.status)}`}>
          {getStatusDisplay(protocol.status)}
        </span>
        <h3 className="protocol-title">{protocol.title}</h3>
      </div>
      
      <div className="protocol-content">
        <p className="protocol-description">
          {protocol.description?.substring(0, 150)}
          {protocol.description?.length > 150 ? '...' : ''}
        </p>
        
        <div className="protocol-meta">
          <div className="meta-item">
            <span className="meta-label">Researcher:</span>
            <span className="meta-value">{protocol.researcher_name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created:</span>
            <span className="meta-value">
              {new Date(protocol.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Views:</span>
            <span className="meta-value">{protocol.view_count}</span>
          </div>
        </div>
      </div>

      <div className="protocol-actions">
        {isResearcher && isOwnProtocol && protocol.status === 'DRAFT' && (
          <button 
            onClick={handleDelete}
            className="btn btn-danger delete-btn"
          >
            Delete
          </button>
        )}
        <Link to={`/protocols/${protocol.id}`} className="btn btn-primary view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProtocolCard; 
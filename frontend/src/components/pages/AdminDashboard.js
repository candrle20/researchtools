import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminDashboard() {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [activeView, setActiveView] = useState('new');
  const [reviewForm, setReviewForm] = useState({
    comments: '',
    showForm: false
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    new_submissions: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching data for view:', activeView);
        const [protocolsRes, statsRes] = await Promise.all([
          api.get('/protocols/', {
            params: { 
              filter: activeView === 'new' ? 'new_submissions' : 
                     activeView === 'review' ? 'in_review' :
                     activeView === 'approved' ? 'approved' : 'rejected'
            }
          }),
          api.get('/protocols/stats/')
        ]);
        console.log('Protocols response:', protocolsRes.data);
        console.log('Stats response:', statsRes.data);
        setProtocols(protocolsRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeView]);

  const handleSendToReview = async (protocolId) => {
    try {
      await api.post(`/protocols/${protocolId}/acknowledge/`);
      setSelectedProtocol(null);
      setProtocols(prevProtocols => 
        prevProtocols.map(protocol => 
          protocol.id === protocolId 
            ? { ...protocol, is_new_submission: false }
            : protocol
        )
      );
      const statsRes = await api.get('/protocols/stats/');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error sending protocol to review:', error);
    }
  };

  const handleSubmitReview = async (protocolId, decision) => {
    try {
      if (!reviewForm.comments.trim()) {
        alert('Please add comments before submitting the review');
        return;
      }

      await api.post(`/protocols/${protocolId}/reviews/`, {
        decision: decision,
        comments: reviewForm.comments
      });

      const [protocolsRes, statsRes] = await Promise.all([
        api.get('/protocols/', {
          params: { 
            filter: activeView === 'new' ? 'new_submissions' : 'in_review'
          }
        }),
        api.get('/protocols/stats/')
      ]);

      setProtocols(protocolsRes.data);
      setStats(statsRes.data);

      setReviewForm({ comments: '', showForm: false });
      setSelectedProtocol(null);

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="admin-dashboard">
      <h1>Protocol Review</h1>
      
      <div className="metrics-container">
        <div 
          className={`metric-box ${activeView === 'new' ? 'active' : ''}`}
          onClick={() => setActiveView('new')}
        >
          <h3 className={`title-box ${activeView === 'new' ? 'active' : ''}`}>New Submissions</h3>
          <span className={`metric-value ${activeView === 'new' ? 'active' : ''}`}>
            {stats.new_submissions}
          </span>
        </div>
        <div 
          className={`metric-box ${activeView === 'review' ? 'active' : ''}`}
          onClick={() => setActiveView('review')}
        >
          <h3 className={`title-box ${activeView === 'review' ? 'active' : ''}`}>In Review</h3>
          <span className={`metric-value ${activeView === 'review' ? 'active' : ''}`}>
            {stats.pending}
          </span>
        </div>
        <div 
          className={`metric-box ${activeView === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveView('approved')}
        >
          <h3 className={`title-box ${activeView === 'approved' ? 'active' : ''}`}>Approved</h3>
          <span className={`metric-value ${activeView === 'approved' ? 'active' : ''}`}>
            {stats.approved}
          </span>
        </div>
        <div 
          className={`metric-box ${activeView === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveView('rejected')}
        >
          <h3 className={`title-box ${activeView === 'rejected' ? 'active' : ''}`}>Rejected</h3>
          <span className={`metric-value ${activeView === 'rejected' ? 'active' : ''}`}>
            {stats.rejected}
          </span>
        </div>
      </div>

      <div className="admin-section">
        <h2>
          {activeView === 'new' ? 'New Submissions' : 
           activeView === 'review' ? 'In Review' :
           activeView === 'approved' ? 'Approved Protocols' : 'Rejected Protocols'}
        </h2>
        <div className="submissions-list">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {protocols.map(protocol => (
                <div key={protocol.id} className="submission-item">
                  <div className="submission-header">
                    <h3>{protocol.title}</h3>
                    {protocol.is_new_submission && (
                      <span className="status-badge status-new">
                        ID: {protocol.id}
                      </span>
                    )}
                  </div>
                  <div className="submission-details">
                    <p><strong>Researcher:</strong> {protocol.researcher_name}</p>
                    <p><strong>Submitted:</strong> {formatDateTime(protocol.submitted_at)}</p>
                    {(activeView === 'approved' || activeView === 'rejected') && (
                      <p><strong>Decision Date:</strong> {formatDateTime(protocol.updated_at)}</p>
                    )}
                  </div>
                  <div className="submission-actions">
                    {selectedProtocol?.id === protocol.id ? (
                      <div className="protocol-full-details">
                        <h4>Protocol Details</h4>
                        <div className="detail-section">
                          <p><strong>Description:</strong></p>
                          <p>{protocol.description}</p>
                        </div>
                        {protocol.file && (
                          <div className="detail-section">
                            <p><strong>Attached File:</strong></p>
                            <a 
                              href={protocol.file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                            >
                              View Document
                            </a>
                          </div>
                        )}
                        {(activeView === 'new' || activeView === 'review') && (
                          <div className="review-actions">
                            {protocol.is_new_submission ? (
                              <button 
                                onClick={() => handleSendToReview(protocol.id)}
                                className="btn btn-primary"
                              >
                                Send to Review
                              </button>
                            ) : (
                              <div className="review-form">
                                <textarea
                                  value={reviewForm.comments}
                                  onChange={(e) => setReviewForm({ 
                                    ...reviewForm, 
                                    comments: e.target.value 
                                  })}
                                  placeholder="Enter review comments (required)..."
                                  className="review-comments"
                                  rows="4"
                                  required
                                />
                                <div className="review-buttons">
                                  <button 
                                    onClick={() => handleSubmitReview(protocol.id, 'APPROVED')}
                                    className="btn btn-success"
                                    disabled={!reviewForm.comments.trim()}
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleSubmitReview(protocol.id, 'REJECTED')}
                                    className="btn btn-danger"
                                    disabled={!reviewForm.comments.trim()}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <button 
                          onClick={() => setSelectedProtocol(null)}
                          className="btn btn-secondary"
                        >
                          Close Details
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedProtocol(protocol)}
                        className="btn btn-primary"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {protocols.length === 0 && (
                <div className="no-submissions">
                  <p>No protocols found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 
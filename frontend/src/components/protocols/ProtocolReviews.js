import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

function ProtocolReviews({ protocolId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ decision: '', comments: '' });
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/protocols/${protocolId}/reviews/`);
      setReviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  }, [protocolId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/protocols/${protocolId}/reviews/`, newReview);
      setNewReview({ decision: '', comments: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="protocol-reviews">
      <h3>Reviews</h3>
      
      {isAdmin && (
        <form onSubmit={handleSubmitReview} className="review-form">
          <div className="form-group">
            <label htmlFor="decision">Decision</label>
            <select
              id="decision"
              value={newReview.decision}
              onChange={(e) => setNewReview(prev => ({
                ...prev,
                decision: e.target.value
              }))}
              required
            >
              <option value="">Select Decision</option>
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              value={newReview.comments}
              onChange={(e) => setNewReview(prev => ({
                ...prev,
                comments: e.target.value
              }))}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            Submit Review
          </button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <span className="review-decision">{review.decision}</span>
              <span className="review-date">
                {new Date(review.review_date).toLocaleDateString()}
              </span>
            </div>
            <p className="review-comments">{review.comments}</p>
            <p className="review-reviewer">By: {review.reviewer_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProtocolReviews; 
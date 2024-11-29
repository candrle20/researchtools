import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

// Move ProfileForm outside the main component
const ProfileForm = ({ formData, handleInputChange, handleSubmit, setIsEditing }) => (
  <form onSubmit={handleSubmit} className="profile-form">
    <div className="form-group">
      <label htmlFor="name">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name || ''}
        onChange={handleInputChange}
        autoComplete="name"
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email || ''}
        onChange={handleInputChange}
        autoComplete="email"
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="institution">Institution</label>
      <input
        type="text"
        id="institution"
        name="institution"
        value={formData.institution || ''}
        onChange={handleInputChange}
        autoComplete="organization"
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="bio">Bio</label>
      <textarea
        id="bio"
        name="bio"
        value={formData.bio || ''}
        onChange={handleInputChange}
        rows="4"
        autoComplete="off"
      />
    </div>

    <div className="form-group">
      <label htmlFor="orcid">ORCID ID</label>
      <input
        type="text"
        id="orcid"
        name="orcid"
        value={formData.orcid || ''}
        onChange={handleInputChange}
        autoComplete="off"
      />
    </div>

    <div className="form-group">
      <label htmlFor="phone">Phone</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        value={formData.phone || ''}
        onChange={handleInputChange}
        autoComplete="tel"
      />
    </div>

    <div className="form-group">
      <label htmlFor="office_location">Office Location</label>
      <input
        type="text"
        id="office_location"
        name="office_location"
        value={formData.office_location || ''}
        onChange={handleInputChange}
        autoComplete="street-address"
      />
    </div>

    <div className="form-actions">
      <button 
        type="button" 
        className="btn btn-secondary"
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        className="btn btn-primary"
      >
        Save Changes
      </button>
    </div>
  </form>
);

// Move ProfileView outside the main component
const ProfileView = ({ formData, setIsEditing }) => (
  <div className="profile-info">
    <div className="profile-header">
      <h2>Profile Information</h2>
      <button 
        onClick={() => setIsEditing(true)}
        className="btn btn-secondary edit-profile-btn"
      >
        Edit Profile
      </button>
    </div>
    
    <div className="profile-details">
      <div className="detail-group">
        <label>Name</label>
        <p>{formData.name || 'Not provided'}</p>
      </div>
      
      <div className="detail-group">
        <label>Email</label>
        <p>{formData.email || 'Not provided'}</p>
      </div>
      
      <div className="detail-group">
        <label>Institution</label>
        <p>{formData.institution || 'Not provided'}</p>
      </div>
      
      <div className="detail-group">
        <label>Bio</label>
        <p>{formData.bio || 'No bio provided'}</p>
      </div>
      
      <div className="detail-group">
        <label>ORCID ID</label>
        <p>{formData.orcid || 'Not provided'}</p>
      </div>
      
      <div className="detail-group">
        <label>Phone</label>
        <p>{formData.phone || 'Not provided'}</p>
      </div>
      
      <div className="detail-group">
        <label>Office Location</label>
        <p>{formData.office_location || 'Not provided'}</p>
      </div>
    </div>
  </div>
);

function UserProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    bio: '',
    orcid: '',
    phone: '',
    office_location: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/researchers/profile/');
      if (response.data) {
        setFormData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        setFormData({
          name: '',
          email: '',
          institution: '',
          bio: '',
          orcid: '',
          phone: '',
          office_location: ''
        });
      } else {
        setError('Failed to load profile');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    const submitData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value || ''])
    );
    
    try {
      const response = await api.put('/researchers/profile/', submitData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setFormData(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.email) {
        setError('Please enter a valid email address');
      } else {
        setError(error.response?.data?.detail || 'Failed to update profile. Please check your input.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="loading-message">Loading profile data...</div>;
  }

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {isEditing ? (
        <ProfileForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          setIsEditing={setIsEditing}
        />
      ) : (
        <ProfileView 
          formData={formData}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
}

export default UserProfile; 
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function ProtocolStandards() {
  const [standards, setStandards] = useState([]);
  const [newStandard, setNewStandard] = useState({
    title: '',
    description: '',
    category: '',
    file: null,
    status: 'DRAFT'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    try {
      const response = await api.get('/standards/');
      setStandards(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching standards:', error);
      setError('Failed to load standards');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    Object.keys(newStandard).forEach(key => {
      if (newStandard[key] !== null) {
        formData.append(key, newStandard[key]);
      }
    });

    try {
      if (isEditing) {
        await api.put(`/standards/${editingId}/`, formData);
        setSuccess('Standard updated successfully');
      } else {
        await api.post('/standards/', formData);
        setSuccess('Standard created successfully');
      }
      
      setNewStandard({
        title: '',
        description: '',
        category: '',
        file: null,
        status: 'DRAFT'
      });
      setIsEditing(false);
      setEditingId(null);
      setShowForm(false);
      fetchStandards();
    } catch (error) {
      setError('Failed to save standard');
      console.error('Error saving standard:', error);
    }
  };

  const handleEdit = (standard) => {
    setNewStandard({
      title: standard.title,
      description: standard.description,
      category: standard.category,
      status: standard.status,
      file: standard.file
    });
    setIsEditing(true);
    setEditingId(standard.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this standard?')) {
      try {
        await api.delete(`/standards/${id}/`);
        setSuccess('Standard deleted successfully');
        fetchStandards();
      } catch (error) {
        setError('Failed to delete standard');
        console.error('Error deleting standard:', error);
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.post(`/standards/${id}/publish/`);
      setSuccess('Standard published successfully');
      fetchStandards();
    } catch (error) {
      setError('Failed to publish standard');
      console.error('Error publishing standard:', error);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await api.post(`/standards/${id}/unpublish/`);
      setSuccess('Standard unpublished successfully');
      fetchStandards();
    } catch (error) {
      setError('Failed to unpublish standard');
      console.error('Error unpublishing standard:', error);
    }
  };

  const handleCancel = () => {
    setNewStandard({
      title: '',
      description: '',
      category: '',
      file: null,
      status: 'DRAFT'
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="standards-management">
      <div className="standards-header">
        <h2>Protocol Standards Management</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Create New Standard
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {showForm && (
        <form onSubmit={handleSubmit} className="standards-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={newStandard.title}
              onChange={(e) => setNewStandard(prev => ({
                ...prev,
                title: e.target.value
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              value={newStandard.category}
              onChange={(e) => setNewStandard(prev => ({
                ...prev,
                category: e.target.value
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newStandard.description}
              onChange={(e) => setNewStandard(prev => ({
                ...prev,
                description: e.target.value
              }))}
              required
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Template File</label>
            <input
              type="file"
              id="file"
              onChange={(e) => setNewStandard(prev => ({
                ...prev,
                file: e.target.files[0]
              }))}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Standard' : 'Create Standard'}
            </button>
          </div>
        </form>
      )}

      <div className="standards-list">
        <h3>Current Standards</h3>
        {loading ? (
          <div>Loading standards...</div>
        ) : (
          <div className="standards-grid">
            {standards.map(standard => (
              <div key={standard.id} className="standard-item">
                <div className="standard-header">
                  <h4>{standard.title}</h4>
                  <span className={`status-badge status-${standard.status.toLowerCase()}`}>
                    {standard.status}
                  </span>
                </div>
                <p className="standard-category">{standard.category}</p>
                <p className="standard-description">{standard.description}</p>
                {standard.file && (
                  <a 
                    href={standard.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="standard-file"
                  >
                    View Template
                  </a>
                )}
                <div className="standard-actions">
                  <button
                    onClick={() => handleEdit(standard)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  {standard.status === 'DRAFT' ? (
                    <button
                      onClick={() => handlePublish(standard.id)}
                      className="btn btn-primary"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnpublish(standard.id)}
                      className="btn btn-warning"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(standard.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtocolStandards; 
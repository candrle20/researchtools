import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

function ProtocolForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    status: 'DRAFT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchProtocol = useCallback(async () => {
    try {
      const response = await api.get(`/protocols/${id}/`);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        file: response.data.file,
        status: response.data.status
      });
    } catch (error) {
      setError('Failed to fetch protocol details');
      console.error('Error fetching protocol:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProtocol();
    }
  }, [id, fetchProtocol]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        if (key === 'file' && formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else if (key !== 'file') {
          data.append(key, formData[key]);
        }
      }
    });

    try {
      if (id) {
        await api.put(`/protocols/${id}/`, data);
      } else {
        await api.post('/protocols/', data);
      }
      navigate('/protocols');
    } catch (error) {
      setError('Failed to save protocol. Please try again.');
      console.error('Error saving protocol:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files?.length > 0) {
      setFormData(prev => ({
        ...prev,
        file: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="protocol-form-container">
      <h2>{id ? 'Edit Protocol' : 'New Protocol'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="protocol-form" encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">Protocol File</label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleChange}
            accept=".pdf,.doc,.docx"
          />
          {formData.file && typeof formData.file === 'string' && (
            <p className="file-info">Current file: {formData.file.split('/').pop()}</p>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/protocols')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Protocol'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProtocolForm; 
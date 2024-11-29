import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

function ProtocolForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchProtocol();
    }
  }, [id]);

  const fetchProtocol = async () => {
    try {
      const response = await api.get(`/protocols/${id}/`);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        file: response.data.file
      });
    } catch (error) {
      console.error('Error fetching protocol:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
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
      console.error('Error saving protocol:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="protocol-form">
      <h2>{id ? 'Edit Protocol' : 'New Protocol'}</h2>
      
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
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Protocol'}
      </button>
    </form>
  );
}

export default ProtocolForm; 
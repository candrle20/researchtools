import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    try {
      const response = await api.get('/standards/', {
        params: { status: 'PUBLISHED' }
      });
      setStandards(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching standards:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/results?type=${searchType}&q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>Research Protocol Management</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="search-type"
            >
              <option value="title">Title</option>
              <option value="description">Description</option>
              <option value="researcher">Researcher</option>
              <option value="status">Status</option>
            </select>
            <div className="search-input-group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search protocols..."
                className="search-input"
                required
              />
              <button type="submit" className="btn btn-primary">
                <span>Search</span>
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="protocol-standards">
        <h2>Protocol Standards</h2>
        {loading ? (
          <div>Loading standards...</div>
        ) : standards.length > 0 ? (
          <div className="standards-list">
            {standards.map(standard => (
              <div key={standard.id} className="standard-list-item">
                <div className="standard-list-content">
                  <div className="standard-list-header">
                    <h3>{standard.title}</h3>
                    <span className="standard-category">{standard.category}</span>
                  </div>
                  <p className="standard-description">
                    {standard.description}
                  </p>
                  <div className="standard-meta">
                    <span>Last updated: {new Date(standard.updated_at).toLocaleDateString()}</span>
                    {standard.file && (
                      <a 
                        href={standard.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        Download Template
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-standards">
            <p>No published protocol standards available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home; 
import React, { useState } from 'react';
import api from '../../utils/api';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/search/?q=${searchTerm}`);
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h2>Search Protocols</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-controls">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search protocols..."
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <div key={result.id} className="protocol-card">
                <h3>{result.title}</h3>
                <p>{result.description}</p>
                {/* Add more result details as needed */}
              </div>
            ))
          ) : (
            searchTerm && <p>No results found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Search; 
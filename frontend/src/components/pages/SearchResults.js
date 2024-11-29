import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchType = searchParams.get('type');
  const query = searchParams.get('q');

  const fetchResults = useCallback(async () => {
    try {
      const response = await api.get('/protocols/search/', {
        params: {
          type: searchType,
          q: query
        }
      });
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch search results');
      setLoading(false);
    }
  }, [searchType, query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) return <div>Loading results...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="search-results">
      <h2>Search Results</h2>
      <p className="search-summary">
        Found {results.length} results for "{query}" in {searchType}
      </p>

      <div className="results-list">
        {results.map(protocol => (
          <div key={protocol.id} className="result-item">
            <div className="result-header">
              <Link to={`/protocols/${protocol.id}`}>
                <h3>{protocol.title}</h3>
              </Link>
              <span className={`status-badge status-${protocol.status.toLowerCase()}`}>
                {protocol.status}
              </span>
            </div>
            <p className="result-description">{protocol.description}</p>
            <div className="result-meta">
              <span>By: {protocol.researcher_name}</span>
              <span>Created: {new Date(protocol.created_at).toLocaleDateString()}</span>
              <span>Downloads: {protocol.download_count}</span>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="no-results">
          <p>No protocols found matching your search criteria.</p>
          <p>Try adjusting your search terms or browse our example protocols.</p>
          <Link to="/search" className="btn btn-secondary">
            Back to Search
          </Link>
        </div>
      )}
    </div>
  );
}

export default SearchResults; 
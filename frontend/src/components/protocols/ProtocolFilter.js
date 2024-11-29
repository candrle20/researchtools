import React from 'react';

function ProtocolFilter({ currentFilter, onFilterChange }) {
  return (
    <div className="protocol-filter">
      <div className="filter-header">
        <h3>Filter Protocols</h3>
      </div>
      <div className="filter-options">
        <button 
          className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All Protocols
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'mine' ? 'active' : ''}`}
          onClick={() => onFilterChange('mine')}
        >
          My Protocols
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'shared' ? 'active' : ''}`}
          onClick={() => onFilterChange('shared')}
        >
          Shared With Me
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'drafts' ? 'active' : ''}`}
          onClick={() => onFilterChange('drafts')}
        >
          Drafts
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'approved' ? 'active' : ''}`}
          onClick={() => onFilterChange('approved')}
        >
          Approved
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'pending' ? 'active' : ''}`}
          onClick={() => onFilterChange('pending')}
        >
          Pending Review
        </button>
      </div>
    </div>
  );
}

export default ProtocolFilter; 
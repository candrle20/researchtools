import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toggleMenu();
  };

  const getPortalTitle = () => {
    if (!user) return 'RAVA Protocol';
    return user.is_staff ? 'Admin Portal' : 'Researcher Portal';
  };

  // If not logged in, only show login link
  if (!user) {
    return (
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <Link to="/login">{getPortalTitle()}</Link>
          </div>
          <div className="navbar-right">
            <Link to="/login" className="login-link">Login</Link>
          </div>
        </div>
      </nav>
    );
  }

  // Show full navigation for logged in users
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/">{getPortalTitle()}</Link>
        </div>
        
        <div className="navbar-right">
          <button className="hamburger-menu" onClick={toggleMenu}>
            <div className="hamburger-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div className={`navbar-menu ${isMenuOpen ? 'show' : ''}`}>
            <div className="menu-items">
              <Link to="/" onClick={toggleMenu}>Home</Link>
              {user?.is_staff ? (
                <>
                  <Link to="/admin/dashboard" onClick={toggleMenu}>Dashboard</Link>
                  <Link to="/admin/users-and-labs" onClick={toggleMenu}>Users & Labs</Link>
                  <Link to="/standards" onClick={toggleMenu}>Protocol Standards</Link>
                  <Link to="/search" onClick={toggleMenu}>Search</Link>
                  <Link to="/profile" onClick={toggleMenu}>Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/protocols" onClick={toggleMenu}>My Protocols</Link>
                  <Link to="/search" onClick={toggleMenu}>Search</Link>
                  <Link to="/profile" onClick={toggleMenu}>Profile</Link>
                </>
              )}
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 
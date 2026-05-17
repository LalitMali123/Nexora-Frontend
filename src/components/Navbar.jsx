import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src="/Nexoralogo.png" alt="Nexora Logo" className="logo-image" />
          <span className="logo-text">Nexora</span>
        </Link>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-item" onClick={closeMenu}>Home</Link>
          {user && (
            <>
              <Link to="/dashboard" className="nav-item" onClick={closeMenu}>Dashboard</Link>
              <Link to="/transactions" className="nav-item" onClick={closeMenu}>Transactions</Link>
              <Link to="/add-expense" className="nav-item" onClick={closeMenu}>Add Expense</Link>
              <Link to="/budget" className="nav-item" onClick={closeMenu}>Budget</Link>
              <Link to="/reports" className="nav-item" onClick={closeMenu}>Reports</Link>
            </>
          )}
          <div className="mobile-auth-buttons">
            {user ? (
              <>
                <span className="user-name-mobile">Hi, {user.username}</span>
                <button onClick={handleLogout} className="btn-logout-mobile">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-login-mobile" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="btn-register-mobile" onClick={closeMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>

        <div className="auth-buttons desktop-only">
          {user ? (
            <>
              <span className="user-name">Hi, {user.username}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Sign Up</Link>
            </>
          )}
        </div>

        <button className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
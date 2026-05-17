import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <img src="/Nexoralogo.png" alt="Nexora Logo" />
          <span className="logo-text">Nexora</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          {user && (
            <>
              <Link to="/dashboard" className="nav-item">Dashboard</Link>
              <Link to="/transactions" className="nav-item">Transactions</Link>
              <Link to="/add-expense" className="nav-item">Add Expense</Link>
              <Link to="/budget" className="nav-item">Budget</Link>
              <Link to="/reports" className="nav-item">Reports</Link>
            </>
          )}
        </div>

        <div className="auth-buttons">
          {user ₹ (
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

        <button className="mobile-menu-btn" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

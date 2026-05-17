import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear specific field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }
        // Clear general error
        if (error) setError('');
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setError('');
        setLoading(true);
        
        const result = await login(formData.username, formData.password);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            // Display the friendly error message from AuthContext
            setError(result.error);
            
            // If it's a credential error, highlight both fields
            if (result.error.includes('Invalid username') || result.error.includes('Invalid credentials')) {
                setFieldErrors({
                    username: 'Invalid username or password',
                    password: 'Invalid username or password'
                });
            }
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to your account</p>
                
                {/* {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )} */}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Enter your username"
                            className={fieldErrors.username ? 'error' : ''}
                        />
                        {fieldErrors.username && !fieldErrors.username.includes('Invalid username') && (
                            <span className="field-error">{fieldErrors.username}</span>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            className={fieldErrors.password ? 'error' : ''}
                        />
                        {fieldErrors.password && !fieldErrors.password.includes('Invalid password') && (
                            <span className="field-error">{fieldErrors.password}</span>
                        )}
                    </div>
                    
                    {/* Show combined error for both fields */}
                    {fieldErrors.username && fieldErrors.username.includes('Invalid username') && (
                        <div className="combined-error">
                            <span className="error-icon">⚠️</span>
                            Invalid username or password. Please try again.
                        </div>
                    )}
                    
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner-small">⏳</span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
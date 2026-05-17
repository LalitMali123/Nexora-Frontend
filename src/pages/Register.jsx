import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/axiosApi';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }
        // Clear general error
        if (error) setError('');
    };

    const validateForm = () => {
        const errors = {};
        
        // Username validation
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 20) {
            errors.username = 'Username must be less than 20 characters';
        }
        
        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            await api.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            const result = await login(formData.username, formData.password);
            
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError('Account created but auto-login failed. Please login manually.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.response?.status === 400) {
                const data = error.response.data;
                if (data.username) {
                    errorMessage = `Username: ${data.username.join(', ')}`;
                    setFieldErrors({ username: data.username.join(', ') });
                } else if (data.email) {
                    errorMessage = `Email: ${data.email.join(', ')}`;
                    setFieldErrors({ email: data.email.join(', ') });
                } else if (data.password) {
                    errorMessage = `Password: ${data.password.join(', ')}`;
                    setFieldErrors({ password: data.password.join(', ') });
                } else {
                    errorMessage = 'Invalid registration data. Please check your information.';
                }
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check your internet connection.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Start tracking your expenses today</p>
                
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
                            placeholder="Choose a username (min 3 characters)"
                            autoComplete="off"
                            className={fieldErrors.username ? 'error' : ''}
                        />
                        {fieldErrors.username && (
                            <span className="field-error">{fieldErrors.username}</span>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            autoComplete="off"
                            className={fieldErrors.email ? 'error' : ''}
                        />
                        {fieldErrors.email && (
                            <span className="field-error">{fieldErrors.email}</span>
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
                            placeholder="Create a password (min 6 characters)"
                            className={fieldErrors.password ? 'error' : ''}
                        />
                        {fieldErrors.password && (
                            <span className="field-error">{fieldErrors.password}</span>
                        )}
                        <span className="password-hint">Password must be at least 6 characters</span>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                            className={fieldErrors.confirmPassword ? 'error' : ''}
                        />
                        {fieldErrors.confirmPassword && (
                            <span className="field-error">{fieldErrors.confirmPassword}</span>
                        )}
                    </div>
                    
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner-small">⏳ Creating Account...</span>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
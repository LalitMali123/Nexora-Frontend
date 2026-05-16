import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.username || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // Register the user
            const registerResponse = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });
            
            const registerData = await registerResponse.json();
            
            if (registerResponse.ok) {
                console.log('Registration successful, now logging in...');
                
                // Login after successful registration
                const loginResponse = await fetch('http://localhost:8000/api/token/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password
                    })
                });
                
                const loginData = await loginResponse.json();
                
                if (loginResponse.ok && loginData.access) {
                    // Save tokens to localStorage
                    localStorage.setItem('access_token', loginData.access);
                    localStorage.setItem('refresh_token', loginData.refresh);
                    localStorage.setItem('user', JSON.stringify({ 
                        username: formData.username, 
                        isAuthenticated: true 
                    }));
                    
                    console.log('Auto-login successful, navigating to dashboard...');
                    
                    // Small delay to ensure localStorage is written
                    setTimeout(() => {
                        navigate('/dashboard');
                        window.location.reload(); // Force reload to update auth state
                    }, 100);
                } else {
                    setError('Account created but auto-login failed. Please login manually.');
                    setTimeout(() => {
                        navigate('/login');
                    }, 1000);
                }
            } else {
                // Handle registration errors
                let errorMessage = 'Registration failed. ';
                if (registerData.username) {
                    errorMessage += `Username: ${registerData.username.join(', ')}. `;
                }
                if (registerData.email) {
                    errorMessage += `Email: ${registerData.email.join(', ')}. `;
                }
                if (registerData.password) {
                    errorMessage += `Password: ${registerData.password.join(', ')}. `;
                }
                setError(errorMessage);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Network error. Please make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Start tracking your expenses today</p>
                
                {error && <div className="error-message">{error}</div>}
                
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
                            placeholder="Choose a username"
                            autoComplete="off"
                        />
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
                        />
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
                        />
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
                        />
                    </div>
                    
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
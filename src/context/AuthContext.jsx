import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/axiosApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        setError(null);
        try {
            const data = await api.login({ username, password });
            
            if (data.access) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                const userData = { username, isAuthenticated: true };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: 'Invalid credentials. Please try again.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Check for specific error types
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 401) {
                    errorMessage = 'Invalid username or password. Please check your credentials and try again.';
                } else if (error.response.status === 400) {
                    errorMessage = 'Invalid request. Please check your input.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
            } else if (error.request) {
                // Request was made but no response
                errorMessage = 'Unable to connect to server. Please check your internet connection.';
            } else {
                // Something else happened
                errorMessage = error.message || 'An unexpected error occurred.';
            }
            
            return { success: false, error: errorMessage };
        }
    };

    const register = async (username, email, password) => {
        setError(null);
        try {
            const data = await api.register({ username, email, password });
            
            if (data.id) {
                // Auto login after registration
                return await login(username, password);
            } else {
                let errorMessage = 'Registration failed. ';
                if (data.username) errorMessage += `Username: ${data.username.join(', ')}. `;
                if (data.email) errorMessage += `Email: ${data.email.join(', ')}. `;
                if (data.password) errorMessage += `Password: ${data.password.join(', ')}. `;
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.response?.status === 400) {
                if (error.response.data?.username) {
                    errorMessage = `Username: ${error.response.data.username.join(', ')}`;
                } else if (error.response.data?.email) {
                    errorMessage = `Email: ${error.response.data.email.join(', ')}`;
                } else if (error.response.data?.password) {
                    errorMessage = `Password must be at least 6 characters.`;
                } else {
                    errorMessage = 'Invalid registration data. Please check your information.';
                }
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check your internet connection.';
            }
            
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            error,
            login, 
            register, 
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};
import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/axiosApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Logging in with:', username);
            const data = await api.login({ username, password });
            
            if (data.access) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                const userData = { username, isAuthenticated: true };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const data = await api.register({ username, email, password });
            if (data.id) {
                // Auto login after registration
                return await login(username, password);
            }
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

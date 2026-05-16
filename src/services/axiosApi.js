import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosApi = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
axiosApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const api = {
    // Auth
    register: async (userData) => {
        const response = await axiosApi.post('/register/', userData);
        return response.data;
    },
    
    login: async (credentials) => {
        const response = await axiosApi.post('/token/', credentials);
        return response.data;
    },
    
    // Transactions
    getTransactions: async () => {
        const response = await axiosApi.get('/transactions/');
        return response.data;
    },
    
    addTransaction: async (transaction) => {
        const response = await axiosApi.post('/transactions/', transaction);
        return response.data;
    },
    
    deleteTransaction: async (id) => {
        const response = await axiosApi.delete(`/transactions/${id}/`);
        return response.data;
    },
    
    // Dashboard
    getDashboard: async () => {
        const response = await axiosApi.get('/dashboard/');
        return response.data;
    },
    
    // Categories
    getCategories: async () => {
        const response = await axiosApi.get('/categories/');
        return response.data;
    },
    
    // Budgets
    getBudgets: async () => {
        const response = await axiosApi.get('/budgets/');
        return response.data;
    },
    
    addBudget: async (budget) => {
        const response = await axiosApi.post('/budgets/', budget);
        return response.data;
    },
};

export default axiosApi;

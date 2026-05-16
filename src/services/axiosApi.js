import axios from 'axios';

// HARDCODED FOR PRODUCTION
const API_URL = 'https://nexora-n5wr.onrender.com/api';

console.log('?? API URL being used:', API_URL);

const axiosApi = axios.create({
    baseURL: API_URL,
    timeout: 30000,
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
        console.log(`?? Making ${config.method.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for debugging
axiosApi.interceptors.response.use(
    (response) => {
        console.log(`? Response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error(`? Error from ${error.config?.url}:`, error.message);
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
    
    deleteBudget: async (id) => {
        const response = await axiosApi.delete(`/budgets/${id}/`);
        return response.data;
    },
};

export default axiosApi;

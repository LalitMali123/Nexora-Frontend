import axios from 'axios';

const axiosApi = axios.create({
    baseURL: 'http://localhost:8000/api',
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
        console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosApi.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
            if (error.response.status === 401) {
                console.log('Token expired or invalid');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export const api = {
    getDashboard: async () => {
        const response = await axiosApi.get('/dashboard/');
        return response.data;
    },
    
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
    
    getCategories: async () => {
        const response = await axiosApi.get('/categories/');
        return response.data;
    },
    
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
    }
};

export default axiosApi;
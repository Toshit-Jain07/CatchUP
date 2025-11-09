import axios from 'axios';

// Base URL for your backend
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests automatically if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    // Register new user
    register: async(userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async(credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Get current user
    getCurrentUser: async() => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

// User Management API calls (Super Admin only)
export const userAPI = {
    // Get all users
    getAllUsers: async() => {
        const response = await api.get('/users');
        return response.data;
    },

    // Update user role
    updateUserRole: async(userId, role) => {
        const response = await api.put(`/users/${userId}/role`, { role });
        return response.data;
    },

    // Delete user
    deleteUser: async(userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    }
};

export default api;
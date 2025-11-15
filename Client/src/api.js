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
    },

    // Forgot password
    forgotPassword: async(email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async(token, newPassword, confirmPassword) => {
        const response = await api.post('/auth/reset-password', {
            token,
            newPassword,
            confirmPassword
        });
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

// PDF API calls
export const pdfAPI = {
    // Get all PDFs with optional filters
    getAllPDFs: async(filters = {}) => {
        const { semester, branch, year, search } = filters;
        const params = new URLSearchParams();
        
        if (semester) params.append('semester', semester);
        if (branch) params.append('branch', branch);
        if (year) params.append('year', year);
        if (search) params.append('search', search);
        
        const response = await api.get(`/pdfs?${params.toString()}`);
        return response.data;
    },

    // Get single PDF by ID
    getPDFById: async(pdfId) => {
        const response = await api.get(`/pdfs/${pdfId}`);
        return response.data;
    },

    // Upload new PDF (Admin/Super Admin only)
    uploadPDF: async(formData) => {
        const response = await api.post('/pdfs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Get semester statistics
    getSemesterStats: async(semesterId) => {
        const response = await api.get(`/pdfs/stats/semester/${semesterId}`);
        return response.data;
    },

    // Update PDF details (Admin/Super Admin or Owner)
    updatePDF: async(pdfId, updateData) => {
        const response = await api.put(`/pdfs/${pdfId}`, updateData);
        return response.data;
    },

    // Delete PDF (Admin/Super Admin or Owner)
    deletePDF: async(pdfId) => {
        const response = await api.delete(`/pdfs/${pdfId}`);
        return response.data;
    },

    // Increment download count
    incrementDownload: async(pdfId) => {
        const response = await api.put(`/pdfs/${pdfId}/download`);
        return response.data;
    },

    // Download PDF with tracking
    downloadPDF: async(pdfId) => {
        // First increment the download count
        await api.put(`/pdfs/${pdfId}/download`);
        // Return the download URL endpoint
        return `${API_BASE_URL}/pdfs/download/${pdfId}`;
    },

    // Get PDF statistics (Admin/Super Admin only)
    getPDFStats: async() => {
        const response = await api.get('/pdfs/stats/overview');
        return response.data;
    }
};

// Rating API calls
export const ratingAPI = {
    // Add or update rating for a PDF
    addRating: async(pdfId, ratingData) => {
        const response = await api.post(`/ratings/${pdfId}`, ratingData);
        return response.data;
    },

    // Get all ratings for a PDF
    getRatings: async(pdfId) => {
        const response = await api.get(`/ratings/${pdfId}`);
        return response.data;
    },

    // Get current user's rating for a PDF
    getUserRating: async(pdfId) => {
        const response = await api.get(`/ratings/user/${pdfId}`);
        return response.data;
    },

    // Delete user's rating
    deleteRating: async(pdfId) => {
        const response = await api.delete(`/ratings/${pdfId}`);
        return response.data;
    }
};

export default api;
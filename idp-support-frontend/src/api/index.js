import axios from 'axios';

export const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        if (response?.status === 401) {
            localStorage.removeItem('token');
        }

        return Promise.reject(error);
    }
);

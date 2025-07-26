// src/context/AuthContext.js
import { useState, useEffect } from 'react';
import { AuthContext } from './useAuth';
import axios from 'axios';
import { redirect } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check token and fetch user on mount
    useEffect(() => {
        const checkLoggedIn = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const res = await axios.get(`${API_URL}/auth/me`);
                    setUser(res.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Token invalid or expired:', err);
                    logout();
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setToken(token);
            setUser(user);
            setIsAuthenticated(true);
            return user;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (firstName, lastName, email, password) => {
        setLoading(true);
        setError(null);
        
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { firstName, lastName, email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setToken(token);
            setUser(user);
            setIsAuthenticated(true);
            return user;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
        redirect('/login');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                error,
                login,
                register,
                logout,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

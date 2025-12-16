import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on load
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    if (res.data.success) {
                        setUser(res.data.data);
                    }
                } catch (err) {
                    console.error('Auth check failed:', err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                // We initially set a partial user, or fetch full profile.
                // The login response returns { token, user: { id, email, createdAt } }
                setUser(res.data.user);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (email, password) => {
        setError(null);
        try {
            const res = await api.post('/auth/register', { email, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                return true;
            }
        } catch (err) {
            // Handle array of errors from express-validator
            const msg = err.response?.data?.errors
                ? err.response.data.errors.map(e => e.msg).join(', ')
                : (err.response?.data?.message || 'Registration failed');
            setError(msg);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

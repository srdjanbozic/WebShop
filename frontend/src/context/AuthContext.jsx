// context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                console.log(' Checking auth with token...');
                const userData = await authAPI.getCurrentUser();
                setUser(userData);
                console.log(' User authenticated:', userData.email);
            } catch (error) {
                console.error(' Auth check failed:', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            console.log(' Attempting login...');
            const response = await authAPI.login(credentials);
            console.log('Login response:', response);

            localStorage.setItem('token', response.access_token);

            const userData = await authAPI.getCurrentUser();
            setUser(userData);

            return response;
        } catch (error) {
            console.error(' Login failed:', error);
            throw new Error(error.message || 'Login failed');
        }
    };

    const register = async (userData) => {
        try {
            console.log(' Attempting registration...');
            const response = await authAPI.register(userData);
            console.log(' Registration response:', response);


            localStorage.setItem('token', response.access_token);

            const userDataResponse = await authAPI.getCurrentUser();
            setUser(userDataResponse);

            return response;
        } catch (error) {
            console.error(' Registration failed:', error);
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = () => {
        console.log(' Logging out...');
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
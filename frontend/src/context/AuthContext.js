import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

// Create the context
const AuthContext = createContext();

// Provider component - wraps entire app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Register function - calls API to create new account
  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    login(response.data.token, response.data.user);
    return response.data;
  };

  // Login function - saves token and user to localStorage
  const loginUser = async (email, password) => {
    const response = await authAPI.login({ email, password });
    login(response.data.token, response.data.user);
    return response.data;
  };

  // Save token and user to state and localStorage
  const login = (tokenData, userData) => {
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  };

  // Logout function - clears everything
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading,
      register,
      login: loginUser,
      logout,
      isLoggedIn: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth anywhere in app
export const useAuth = () => useContext(AuthContext);
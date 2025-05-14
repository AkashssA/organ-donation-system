import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set axios baseURL and auth header
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  // Axios interceptor to catch 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register', userData);
      if (response.data.message) {
        await login({
          email: userData.email,
          password: userData.password,
        });
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const login = useCallback(async (credentials) => {
    try {
      const response = await axios.post('/api/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);

      const redirectPath = {
        admin: '/admin',
        hospital: '/hospital',
        donor: '/donor',
        recipient: '/recipient',
      }[user.role.toLowerCase()] || '/';

      navigate(redirectPath);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.message || 'Login failed';
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const verifyToken = useCallback(async () => {
    try {
      if (token) {
        const response = await axios.get('/api/protected');
        setUser(response.data.user);
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const updateUserData = useCallback(async () => {
    try {
      const response = await axios.get('/api/protected');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const contextValue = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUserData,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

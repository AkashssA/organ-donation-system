import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Set axios defaults
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', userData);
      if (response.data.message) {
        await login({ email: userData.email, password: userData.password });
      }
    } catch (error) {
      throw error.response.data.message || 'Registration failed';
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      // Redirect based on role
      switch(user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'hospital':
          navigate('/hospital');
          break;
        case 'donor':
          navigate('/donor');
          break;
        case 'recipient':
          navigate('/recipient');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      throw error.response.data.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (token) {
          const response = await axios.get('http://localhost:5000/api/protected');
          setUser(response.data.user);
        }
      } catch (error) {
        logout();
      }
    };

    if (token) verifyToken();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
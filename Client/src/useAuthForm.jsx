import { useState , useEffect} from 'react';
import { authAPI } from './api';

export function useAuthForm() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // LOGIN
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        // Save token and user data to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));

        // Success! Show alert and redirect
        alert(`Welcome back, ${response.data.name}! You are logged in as ${response.data.role}.`);
        
        // Redirect to dashboard (we'll create this later)
        window.location.href = '/dashboard';

      } else {
        // REGISTER
        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });

        // Save token and user data to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));

        // Success! Show alert and redirect
        alert(`Welcome, ${response.data.name}! Your account has been created as ${response.data.role}.`);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }

    } catch (err) {
      // Handle errors
      console.error('Auth error:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
  };

  return {
    isDark,
    setIsDark,
    isLogin,
    showPassword,
    setShowPassword,
    formData,
    loading,
    error,
    handleInputChange,
    handleSubmit,
    toggleMode
  };
}

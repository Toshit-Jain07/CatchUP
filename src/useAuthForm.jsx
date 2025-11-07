import { useState } from 'react';

export function useAuthForm() {
  const [isDark, setIsDark] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(`${isLogin ? 'Login' : 'Signup'} functionality will be connected to backend!`);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return {
    isDark,
    setIsDark,
    isLogin,
    showPassword,
    setShowPassword,
    formData,
    handleInputChange,
    handleSubmit,
    toggleMode
  };
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Moon, Sun, Book, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from './api';

export default function ResetPassword() {
  const [isDark, setIsDark] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword(token, formData.newPassword, formData.confirmPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-lg'
        }`}
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Main Container */}
      <div className={`w-full max-w-md mx-4 transition-all duration-300 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-2xl shadow-2xl overflow-hidden`}>
        
        {/* Header */}
        <div className={`p-8 text-center ${
          isDark 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        }`}>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
              <Book className="text-blue-600" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-blue-100">Create a new password for your account</p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  {error}
                </div>
              )}

              {/* New Password */}
              <div className="relative">
                <Lock className={`absolute left-3 top-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="New Password"
                  required
                  className={`w-full pl-11 pr-11 py-3 rounded-lg border-2 transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 ${
                    isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className={`absolute left-3 top-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm New Password"
                  required
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>

              {/* Password Requirements */}
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Password must be at least 6 characters long</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !token}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                  (loading || !token) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`w-full text-sm ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                } transition-colors`}
              >
                Back to Login
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full">
                  <CheckCircle className="text-white" size={64} />
                </div>
              </div>
              
              <h2 className={`text-2xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Password Reset Successful! 🎉
              </h2>
              
              <p className={`mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Your password has been successfully reset.
              </p>

              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
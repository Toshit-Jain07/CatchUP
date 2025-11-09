import { useState } from 'react';
import { Moon, Sun, Book, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthForm } from './useAuthForm';
import ComingSoonModal from './ComingSoonModal';
import ForgotPasswordModal from './ForgotPasswordModal';


export default function AuthPage() {
  const {
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
} = useAuthForm();

// Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalService, setModalService] = useState('');
  // Forgot Password Modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSocialLogin = (service) => {
    setModalService(service);
    setShowModal(true);
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
          <h1 className="text-3xl font-bold text-white mb-2">CatchUp</h1>
          <p className="text-blue-100">Your Academic Resource Hub</p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {/* Toggle Tabs */}
          <div className={`flex mb-8 rounded-lg p-1 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                isLogin
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-blue-600 shadow-md'
                  : isDark
                    ? 'text-gray-400'
                    : 'text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                !isLogin
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-blue-600 shadow-md'
                  : isDark
                    ? 'text-gray-400'
                    : 'text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Field */}
            {!isLogin && (
              <div className="relative">
                <User className={`absolute left-3 top-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required={!isLogin}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className={`absolute left-3 top-3 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none`}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className={`absolute left-3 top-3 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
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
            {!isLogin && (
              <div className="relative">
                <Lock className={`absolute left-3 top-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  required={!isLogin}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>
            )}

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className={`text-sm ${
                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  } transition-colors`}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className={`absolute inset-0 flex items-center`}>
              <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className={`flex items-center justify-center px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                isDark
                  ? 'border-gray-700 hover:bg-gray-700 text-gray-300'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            
            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className={`flex items-center justify-center px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                isDark
                  ? 'border-gray-700 hover:bg-gray-700 text-gray-300'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Terms */}
          {!isLogin && (
            <p className={`text-xs text-center mt-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              By signing up, you agree to our{' '}
              <a href="#" className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        service={modalService}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        isDark={isDark}
      />
    </div>
  );
}

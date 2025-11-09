import { useState } from 'react';
import { X, Mail, KeyRound } from 'lucide-react';
import { authAPI } from './api';

export default function ForgotPasswordModal({ isOpen, onClose, isDark }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(true);
      
      // For development - show the token
      if (response.devToken) {
        setResetToken(response.devToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    setResetToken('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className={`${
        isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-all"
        >
          <X className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} size={24} />
        </button>

        {!success ? (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                <KeyRound className="text-white" size={48} />
              </div>
            </div>

            {/* Title */}
            <h2 className={`text-3xl font-bold text-center mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Forgot Password?
            </h2>
            <p className={`text-center mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No worries! Enter your email and we'll send you reset instructions.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <Mail className={`absolute left-3 top-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={handleClose}
                className={`w-full py-2 text-sm ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } transition-colors`}
              >
                Back to Login
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full">
                <Mail className="text-white" size={48} />
              </div>
            </div>

            <h2 className={`text-3xl font-bold text-center mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Check Your Email! 📧
            </h2>

            <p className={`text-center mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              We've sent password reset instructions to <strong>{email}</strong>
            </p>

            {/* Development Token (remove in production) */}
            {resetToken && (
              <div className={`p-4 rounded-lg mb-6 ${
                isDark ? 'bg-yellow-900/20 border border-yellow-500/50' : 'bg-yellow-50 border border-yellow-300'
              }`}>
                <p className={`text-sm font-semibold mb-2 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-800'
                }`}>
                  🔧 Development Mode
                </p>
                <p className={`text-xs mb-2 ${
                  isDark ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  Click the link below to reset your password:
                </p>
                <a
                  href={`/reset-password?token=${resetToken}`}
                  className="text-blue-500 hover:text-blue-400 text-xs break-all underline"
                >
                  Reset Password Link
                </a>
              </div>
            )}

            <div className={`p-4 rounded-lg mb-6 ${
              isDark ? 'bg-blue-900/30 border border-blue-500/50' : 'bg-blue-50 border border-blue-300'
            }`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Got it!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
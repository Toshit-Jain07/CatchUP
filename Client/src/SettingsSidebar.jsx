import { X, Upload, FileText, Crown, Sun, Moon, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import PDFUploadModal from './PDFUploadModal';

export default function SettingsSidebar({ isOpen, onClose, user, isDark, setIsDark, onLogout }) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const isSuperAdmin = user.role === 'superadmin';
  
  const getProfileImage = () => {
    const savedImage = localStorage.getItem(`profileImage_${user._id}`);
    return savedImage;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            {getProfileImage() ? (
              <img 
                src={getProfileImage()} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                user.role === 'superadmin' 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                  : user.role === 'admin'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              } text-white`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user.name}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {user.email}
              </p>
              <p className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                user.role === 'superadmin'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : user.role === 'admin'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
              }`}>
                {user.role === 'superadmin' ? '👑 Super Admin' : user.role === 'admin' ? '🛡️ Admin' : '👤 Student'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="flex-1 text-left font-medium">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Admin Actions */}
          {isAdmin && (
            <>
              <div className={`px-4 py-2 text-xs font-semibold uppercase ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Admin Actions
              </div>

              <button
                onClick={() => {
                  setShowUploadModal(true);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isDark 
                    ? 'hover:bg-blue-900/30 text-blue-400' 
                    : 'hover:bg-blue-50 text-blue-600'
                }`}
              >
                <Upload size={20} />
                <span className="flex-1 text-left font-medium">Upload Notes</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  alert('Manage Notes feature coming soon!');
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isDark 
                    ? 'hover:bg-purple-900/30 text-purple-400' 
                    : 'hover:bg-purple-50 text-purple-600'
                }`}
              >
                <FileText size={20} />
                <span className="flex-1 text-left font-medium">Manage Notes</span>
              </button>
            </>
          )}

          {/* Super Admin Actions */}
          {isSuperAdmin && (
            <>
              <div className={`px-4 py-2 text-xs font-semibold uppercase ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Super Admin
              </div>

              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/user-management';
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isDark 
                    ? 'hover:bg-yellow-900/30 text-yellow-400' 
                    : 'hover:bg-yellow-50 text-yellow-600'
                }`}
              >
                <Crown size={20} />
                <span className="flex-1 text-left font-medium">Manage Users</span>
              </button>
            </>
          )}

          {/* Account Settings */}
          <div className={`px-4 py-2 text-xs font-semibold uppercase ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Account
          </div>

          <button
            onClick={() => {
              onClose();
              window.location.href = '/profile';
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <User size={20} />
            <span className="flex-1 text-left font-medium">Edit Profile</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* PDF Upload Modal */}
      <PDFUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        isDark={isDark}
      />
    </>
  );
}
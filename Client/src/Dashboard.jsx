import { useEffect, useState } from 'react';
import { Book, Settings } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // If no user, redirect to login
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const getProfileColor = () => {
    if (user.role === 'superadmin') return 'from-yellow-500 to-orange-600';
    if (user.role === 'admin') return 'from-blue-500 to-indigo-600';
    return 'from-gray-500 to-gray-600';
  };

  const getProfileImage = () => {
    const savedImage = localStorage.getItem(`profileImage_${user._id}`);
    return savedImage;
  };

  const getRoleText = () => {
    if (user.role === 'superadmin') return '👑 Super Admin';
    if (user.role === 'admin') return '🛡️ Admin';
    return '👤 Student';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      
      {/* Header */}
      <header className={`${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            
            {/* Left: Profile Picture with Tooltip */}
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {getProfileImage() ? (
                <img 
                  src={getProfileImage()} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-blue-500"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getProfileColor()} flex items-center justify-center text-white text-xl font-bold cursor-pointer hover:scale-110 transition-transform shadow-lg`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Tooltip */}
              {showTooltip && (
                <div className={`absolute top-full left-0 mt-2 px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-fadeIn ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs opacity-75">{getRoleText()}</p>
                </div>
              )}
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Book className="text-white" size={28} />
              </div>
              <h1 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                CatchUp
              </h1>
            </div>

            {/* Right: Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className={`p-3 rounded-lg transition-all ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Welcome Section */}
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-xl p-8 mb-8`}>
          <h2 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, {user.name}! 👋
          </h2>
          <p className={`text-lg ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {user.role === 'superadmin' 
              ? 'You have full admin access. Manage users and all content.'
              : user.role === 'admin'
              ? 'You can upload and manage notes for all students.'
              : 'Browse and download notes from your courses.'}
          </p>
        </div>

        {/* Notes Section */}
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-xl p-8`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Available Notes 📚
            </h3>
            
            {/* Search bar placeholder */}
            <input
              type="text"
              placeholder="Search notes..."
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none`}
            />
          </div>
          
          <div className={`text-center py-16 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Book size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No notes available yet.</p>
            <p className="text-sm mt-2">
              {user.role !== 'student'
                ? 'Upload your first note from the settings menu!'
                : 'Check back soon for new notes from your instructors.'}
            </p>
          </div>
        </div>
      </main>

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        isDark={isDark}
        setIsDark={setIsDark}
        onLogout={handleLogout}
      />
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Moon, Sun, Book, LogOut, Upload, FileText, Crown } from 'lucide-react';

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);

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
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      
      {/* Header */}
      <header className={`${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Book className="text-white" size={28} />
              </div>
              <h1 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                CatchUp
              </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              
              {/* User Info */}
              <div className={`text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm opacity-75">
                  {user.role === 'superadmin'
                    ? '👑 Super Admin'
                    : user.role === 'admin'
                    ? '👑 Admin'
                    : '👤 Student'}
                </p>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
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
            {user.role === 'admin' 
              ? 'You have admin access. You can upload and manage notes for all students.'
              : 'Browse and download notes from your courses.'}
          </p>
        </div>

        {/* Admin Actions */}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <div className={`${
            isDark ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-100 to-purple-100'
          } rounded-2xl shadow-xl p-8 mb-8 border-2 ${
            user.role === 'superadmin' ? 'border-yellow-500' : 'border-blue-500'
          }`}>
            <h3 className={`text-2xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {user.role === 'superadmin' ? '👑 Super Admin Actions' : 'Admin Actions 👑'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-lg">
                <Upload size={24} />
                <div className="text-left">
                  <p className="font-semibold text-lg">Upload Notes</p>
                  <p className="text-sm opacity-90">Add new PDF notes</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all shadow-lg">
                <FileText size={24} />
                <div className="text-left">
                  <p className="font-semibold text-lg">Manage Notes</p>
                  <p className="text-sm opacity-90">Edit or delete notes</p>
                </div>
              </button>

              {/* Super Admin Only Button */}
              {user.role === 'superadmin' && (
                <button 
                  onClick={() => window.location.href = '/user-management'}
                  className="flex items-center space-x-3 p-6 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl transition-all shadow-lg md:col-span-2"
                >
                  <Crown size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-lg">Manage Users</p>
                    <p className="text-sm opacity-90">Change roles & manage user accounts</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Notes Section (Placeholder) */}
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-xl p-8`}>
          <h3 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Available Notes 📚
          </h3>
          
          <div className={`text-center py-12 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <FileText size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No notes available yet.</p>
            <p className="text-sm mt-2">
              {user.role === 'admin' 
                ? 'Upload your first note using the button above!'
                : 'Check back soon for new notes from your instructors.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
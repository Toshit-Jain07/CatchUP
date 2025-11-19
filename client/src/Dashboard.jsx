import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Settings, GraduationCap, BookOpen } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const semesters = [
    { id: 1, name: 'Semester 1', icon: '1️⃣', color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'Semester 2', icon: '2️⃣', color: 'from-purple-500 to-pink-500' },
    { id: 3, name: 'Semester 3', icon: '3️⃣', color: 'from-green-500 to-emerald-500' },
    { id: 4, name: 'Semester 4', icon: '4️⃣', color: 'from-orange-500 to-red-500' },
    { id: 5, name: 'Semester 5', icon: '5️⃣', color: 'from-indigo-500 to-blue-500' },
    { id: 6, name: 'Semester 6', icon: '6️⃣', color: 'from-pink-500 to-rose-500' },
    { id: 7, name: 'Semester 7', icon: '7️⃣', color: 'from-teal-500 to-cyan-500' },
    { id: 8, name: 'Semester 8', icon: '8️⃣', color: 'from-yellow-500 to-orange-500' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSemesterClick = (semId) => {
    navigate(`/semester/${semId}/departments`);
  };

  const handleLiberalArtsClick = () => {
    navigate('/liberal-arts');
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
    return user?.profileImage;
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
        } rounded-2xl shadow-xl p-8 mb-12`}>
          <h2 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, {user.name}! 👋
          </h2>
          <p className={`text-lg ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Choose a semester to access notes from different departments
          </p>
        </div>

        {/* Semester Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {semesters.map((semester) => (
            <button
              key={semester.id}
              onClick={() => handleSemesterClick(semester.id)}
              className={`group relative ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${semester.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-4">{semester.icon}</div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {semester.name}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
                } transition-colors`}>
                  View departments →
                </p>
              </div>

              <div className={`absolute inset-0 border-2 border-transparent group-hover:border-opacity-50 rounded-2xl bg-gradient-to-br ${semester.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
            </button>
          ))}
        </div>

        {/* Liberal Arts Section */}
        <div className="mt-12">
          <div className={`${
            isDark 
              ? 'bg-gradient-to-r from-blue-600 to-violet-600' 
              : 'bg-gradient-to-r from-blue-300 to-violet-200'
          } rounded-2xl shadow-2xl overflow-hidden`}>
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-6 mb-6 md:mb-0">
                  <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                    <GraduationCap className="text-white" size={48} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-2">
                      <span>Liberal Arts</span>
                      <span className="text-2xl">🎨</span>
                    </h2>
                    <p className="text-purple-200 text-lg">
                      Access all Liberal Arts resources and notes
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLiberalArtsClick}
                  className="bg-white hover:bg-gray-100 text-purple-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <BookOpen size={24} />
                  <span>View Notes</span>
                </button>
              </div>
            </div>
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
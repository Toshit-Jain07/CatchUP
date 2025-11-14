import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Cpu, Cog, Zap, Building, FlaskConical, Calculator, Briefcase, Settings } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';

export default function SemesterDepartments() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { semesterId } = useParams();

  const departments = [
    { 
      id: 'cse', 
      name: 'Computer Science', 
      shortName: 'CSE',
      icon: Cpu,
      color: 'from-blue-500 to-cyan-500',
      description: 'Software, Algorithms, Data Structures'
    },
    { 
      id: 'ece', 
      name: 'Electronics & Communication', 
      shortName: 'ECE',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      description: 'Circuits, Signals, Communication'
    },
    { 
      id: 'eee', 
      name: 'Electrical Engineering', 
      shortName: 'EEE',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      description: 'Power Systems, Machines, Control'
    },
    { 
      id: 'mechanical', 
      name: 'Mechanical Engineering', 
      shortName: 'MECH',
      icon: Cog,
      color: 'from-gray-500 to-gray-700',
      description: 'Thermodynamics, Mechanics, Design'
    },
    { 
      id: 'civil', 
      name: 'Civil Engineering', 
      shortName: 'CIVIL',
      icon: Building,
      color: 'from-green-500 to-emerald-500',
      description: 'Structures, Construction, Materials'
    },
    { 
      id: 'it', 
      name: 'Information Technology', 
      shortName: 'IT',
      icon: Cpu,
      color: 'from-indigo-500 to-blue-500',
      description: 'Networks, Database, Web Development'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleDepartmentClick = (deptId) => {
    navigate(`/semester/${semesterId}/department/${deptId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Semester {semesterId}
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select a department to view notes
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className={`p-3 rounded-lg transition-all ${
                isDark ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Department Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <button
                key={dept.id}
                onClick={() => handleDepartmentClick(dept.id)}
                className={`group relative ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden text-left`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`bg-gradient-to-br ${dept.color} p-4 rounded-xl inline-block mb-4`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {dept.shortName}
                  </span>
                  
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dept.name}
                  </h3>
                  
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } group-hover:${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>
                    {dept.description}
                  </p>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    } group-hover:${isDark ? 'text-blue-400' : 'text-blue-600'} transition-colors`}>
                      View Notes
                    </span>
                    <ArrowLeft className={`transform rotate-180 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    } group-hover:${isDark ? 'text-blue-400' : 'text-blue-600'} group-hover:translate-x-2 transition-all`} size={16} />
                  </div>
                </div>

                <div className={`absolute inset-0 border-2 border-transparent group-hover:border-opacity-30 rounded-2xl bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              </button>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className={`mt-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-xl`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Semester {semesterId} Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6`}>
              <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                156
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Notes Available
              </p>
            </div>
            <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6`}>
              <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {departments.length}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Departments
              </p>
            </div>
            <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6`}>
              <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                4.8★
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Rating
              </p>
            </div>
          </div>
        </div>
      </main>

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
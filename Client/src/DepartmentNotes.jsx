import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Star, Eye, Calendar, User, Search, Filter, Settings } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';

export default function DepartmentNotes() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const navigate = useNavigate();
  const { semesterId, departmentId } = useParams();

  // Department name mapping
  const departmentNames = {
    'cse': { full: 'Computer Science', short: 'CSE' },
    'ece': { full: 'Electronics & Communication', short: 'ECE' },
    'mechanical': { full: 'Mechanical Engineering', short: 'ME' },
    'civil': { full: 'Civil Engineering', short: 'CE' },
    'chemical': { full: 'Chemical Engineering', short: 'CHE' },
    'mathematics': { full: 'Mathematics', short: 'MATH' },
    'mba': { full: 'Management', short: 'MBA' }
  };

  const currentDept = departmentNames[departmentId] || { full: 'Department', short: 'DEPT' };

  // Mock notes data - Replace with API call
  const notes = [
    {
      id: 1,
      title: 'Introduction to Programming - Complete Notes',
      subject: 'Programming Fundamentals',
      uploadedBy: 'Dr. Sharma',
      uploadDate: '2024-01-15',
      downloads: 245,
      views: 1203,
      rating: 4.8,
      reviews: 42,
      fileSize: '2.4 MB',
      pages: 87
    },
    {
      id: 2,
      title: 'Data Structures - Arrays and Linked Lists',
      subject: 'Data Structures',
      uploadedBy: 'Prof. Kumar',
      uploadDate: '2024-01-20',
      downloads: 189,
      views: 876,
      rating: 4.6,
      reviews: 31,
      fileSize: '1.8 MB',
      pages: 56
    },
    {
      id: 3,
      title: 'Database Management Systems - SQL Guide',
      subject: 'Database Systems',
      uploadedBy: 'Dr. Patel',
      uploadDate: '2024-02-01',
      downloads: 312,
      views: 1456,
      rating: 4.9,
      reviews: 67,
      fileSize: '3.1 MB',
      pages: 112
    },
    {
      id: 4,
      title: 'Computer Networks - OSI Model Explained',
      subject: 'Computer Networks',
      uploadedBy: 'Prof. Singh',
      uploadDate: '2024-02-10',
      downloads: 167,
      views: 723,
      rating: 4.5,
      reviews: 28,
      fileSize: '2.0 MB',
      pages: 68
    },
    {
      id: 5,
      title: 'Operating Systems - Process Management',
      subject: 'Operating Systems',
      uploadedBy: 'Dr. Verma',
      uploadDate: '2024-02-15',
      downloads: 201,
      views: 934,
      rating: 4.7,
      reviews: 45,
      fileSize: '2.7 MB',
      pages: 94
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

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (noteId, noteTitle) => {
    // TODO: Implement actual download logic
    alert(`Downloading: ${noteTitle}`);
  };

  const handleView = (noteId) => {
    // TODO: Implement PDF viewer
    alert(`Opening PDF viewer for note ID: ${noteId}`);
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
                onClick={() => navigate(`/semester/${semesterId}/departments`)}
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentDept.full}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {currentDept.short}
                  </span>
                </div>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Semester {semesterId} • {filteredNotes.length} Notes Available
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search and Filter Bar */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder="Search notes by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none`}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className={isDark ? 'text-gray-400' : 'text-gray-500'} size={20} />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none`}
              >
                <option value="all">All Notes</option>
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="top-rated">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
              <FileText className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={64} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No notes found matching your search.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 ${
                  isDark ? 'border-gray-700 hover:border-blue-500/50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Left: Note Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-lg flex-shrink-0">
                        <FileText className="text-white" size={28} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {note.title}
                        </h3>
                        <p className={`text-sm mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                          {note.subject}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <User size={16} />
                            <span>{note.uploadedBy}</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar size={16} />
                            <span>{new Date(note.uploadDate).toLocaleDateString()}</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <FileText size={16} />
                            <span>{note.pages} pages • {note.fileSize}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats & Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className={`flex items-center space-x-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        <Star size={16} fill="currentColor" />
                        <span className="font-semibold">{note.rating}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>({note.reviews})</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Download size={16} />
                        <span>{note.downloads}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Eye size={16} />
                        <span>{note.views}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(note.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                          isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                      >
                        <Eye size={18} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownload(note.id, note.title)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                      >
                        <Download size={18} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
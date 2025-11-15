import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Star, Eye, Calendar, User, Search, Filter, GraduationCap, Settings } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';

export default function LiberalArtsNotes() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Mock Liberal Arts notes data
  const notes = [
    {
      id: 1,
      title: 'Introduction to Philosophy - Ancient Greek Thought',
      subject: 'Philosophy',
      uploadedBy: 'Dr. Mehta',
      uploadDate: '2024-01-15',
      downloads: 178,
      views: 892,
      rating: 4.7,
      reviews: 35,
      fileSize: '2.1 MB',
      pages: 64
    },
    {
      id: 2,
      title: 'World History - Renaissance Period',
      subject: 'History',
      uploadedBy: 'Prof. Kapoor',
      uploadDate: '2024-01-22',
      downloads: 234,
      views: 1105,
      rating: 4.9,
      reviews: 48,
      fileSize: '3.5 MB',
      pages: 96
    },
    {
      id: 3,
      title: 'English Literature - Romantic Poetry',
      subject: 'English',
      uploadedBy: 'Dr. Sharma',
      uploadDate: '2024-02-05',
      downloads: 201,
      views: 967,
      rating: 4.6,
      reviews: 41,
      fileSize: '1.9 MB',
      pages: 52
    },
    {
      id: 4,
      title: 'Psychology - Cognitive Development',
      subject: 'Psychology',
      uploadedBy: 'Prof. Gupta',
      uploadDate: '2024-02-12',
      downloads: 156,
      views: 734,
      rating: 4.8,
      reviews: 29,
      fileSize: '2.3 MB',
      pages: 71
    },
    {
      id: 5,
      title: 'Sociology - Social Institutions',
      subject: 'Sociology',
      uploadedBy: 'Dr. Reddy',
      uploadDate: '2024-02-18',
      downloads: 143,
      views: 689,
      rating: 4.5,
      reviews: 27,
      fileSize: '2.0 MB',
      pages: 58
    },
    {
      id: 6,
      title: 'Economics - Macroeconomic Theory',
      subject: 'Economics',
      uploadedBy: 'Prof. Iyer',
      uploadDate: '2024-02-25',
      downloads: 267,
      views: 1234,
      rating: 4.9,
      reviews: 52,
      fileSize: '2.8 MB',
      pages: 89
    },
    {
      id: 7,
      title: 'Political Science - Democratic Governance',
      subject: 'Political Science',
      uploadedBy: 'Dr. Nair',
      uploadDate: '2024-03-01',
      downloads: 189,
      views: 845,
      rating: 4.7,
      reviews: 38,
      fileSize: '2.4 MB',
      pages: 76
    },
    {
      id: 8,
      title: 'Art History - Modern Art Movements',
      subject: 'Art History',
      uploadedBy: 'Prof. Desai',
      uploadDate: '2024-03-08',
      downloads: 198,
      views: 912,
      rating: 4.8,
      reviews: 43,
      fileSize: '4.2 MB',
      pages: 103
    }
  ];

  const subjects = ['All', 'Philosophy', 'History', 'English', 'Psychology', 'Sociology', 'Economics', 'Political Science', 'Art History'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

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
      <header className={`${isDark ? 'bg-gradient-to-r from-purple-900 to-indigo-900' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} shadow-lg sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg transition-all bg-white/10 hover:bg-white/20 text-white"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="text-white" size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
                    <span>Liberal Arts</span>
                    <span className="text-2xl">🎨</span>
                  </h1>
                  <p className="text-purple-200">
                    {filteredNotes.length} Resources Available
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-lg transition-all bg-white/10 hover:bg-white/20 text-white"
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
                placeholder="Search by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
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
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
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

        {/* Subject Categories */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Browse by Subject
          </h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  subject === selectedSubject
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {subject}
              </button>
            ))}
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
                  isDark ? 'border-gray-700 hover:border-purple-500/50' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-lg flex-shrink-0">
                        <FileText className="text-white" size={28} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {note.title}
                        </h3>
                        <p className={`text-sm mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'} font-medium`}>
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
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
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
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SettingsSidebar from './SettingsSidebar';
import { pdfAPI } from './api';
import { ArrowLeft, FileText, Download, Star, Eye, Calendar, User, Search, Filter, Settings, Edit, Trash2 } from 'lucide-react';
import PDFEditModal from './PDFEditModal';
import RatingModal from './RatingModal';
import ReviewsList from './ReviewsList';


export default function DepartmentNotes() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { semesterId, departmentId } = useParams();
  const [editingPDF, setEditingPDF] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviews, setShowReviews] = useState({});


  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Department name mapping
  const departmentNames = {
    'cse': { full: 'Computer Science', short: 'CSE', backendCode: 'CSE' },
    'ece': { full: 'Electronics & Communication', short: 'ECE', backendCode: 'ECE' },
    'eee': { full: 'Electrical Engineering', short: 'EEE', backendCode: 'EEE' },
    'mechanical': { full: 'Mechanical Engineering', short: 'MECH', backendCode: 'MECH' },
    'civil': { full: 'Civil Engineering', short: 'CIVIL', backendCode: 'CIVIL' },
    'it': { full: 'Information Technology', short: 'IT', backendCode: 'IT' }
  };

  const currentDept = departmentNames[departmentId] || { full: 'Department', short: 'DEPT', backendCode: 'OTHER' };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch PDFs from backend
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await pdfAPI.getAllPDFs({
          semester: semesterId,
          branch: currentDept.backendCode
        });

        setNotes(response.data || []);
      } catch (err) {
        console.error('Error fetching PDFs:', err);
        setError('Failed to load notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPDFs();
    }
  }, [semesterId, currentDept.backendCode, user]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleView = async (pdfId, fileUrl) => {
  try {
    // Only increment view count, don't increment downloads
    await pdfAPI.getPDFById(pdfId);
    
    // Open PDF in new tab for viewing (not downloading)
    window.open(fileUrl, '_blank');
  } catch (error) {
    console.error('View error:', error);
    alert('Failed to view PDF');
  }
};

  const handleDownload = async (pdfId, fileUrl, fileName) => {
    try {
      // Increment download count only
      await pdfAPI.incrementDownload(pdfId);
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF');
    }
  };
  const handleEdit = (pdf) => {
    setEditingPDF(pdf);
    setShowEditModal(true);
  };

  const handleDelete = async (pdfId, pdfTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${pdfTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await pdfAPI.deletePDF(pdfId);
      alert('PDF deleted successfully!');
      // Refresh the list
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete PDF');
    }
  };

  const handleEditSuccess = () => {
    alert('PDF updated successfully!');
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRateClick = (pdf) => {
    setSelectedPDF(pdf);
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    alert('Thank you for your review!');
    // Refresh the notes list to show updated rating
    window.location.reload();
  };

  const toggleReviews = (pdfId) => {
    setShowReviews(prev => ({
      ...prev,
      [pdfId]: !prev[pdfId]
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
                placeholder="Search notes by title or description..."
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

        {/* Loading State */}
        {loading && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading notes...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Notes List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
                <FileText className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={64} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No notes found for this semester and department.
                </p>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Upload notes from the settings menu to get started!
                  </p>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                    isDark ? 'border-gray-700 hover:border-blue-500/50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="p-6">
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
                            {note.description && (
                              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {note.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <User size={16} />
                                <span>{note.uploadedBy?.name || 'Unknown'}</span>
                              </div>
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Calendar size={16} />
                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <FileText size={16} />
                                <span>{formatFileSize(note.fileSize)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Stats & Actions */}
                      <div className="flex flex-col items-end space-y-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <button
                            onClick={() => toggleReviews(note._id)}
                            className={`flex items-center space-x-1 hover:scale-110 transition-transform ${
                              isDark ? 'text-yellow-400' : 'text-yellow-600'
                            }`}
                            title="View reviews"
                          >
                            <Star size={16} fill="currentColor" />
                            <span className="font-semibold">{note.averageRating || 0}</span>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>({note.totalRatings || 0})</span>
                          </button>
                          <div className={`flex items-center space-x-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Download size={16} />
                            <span>{note.downloads || 0}</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Eye size={16} />
                            <span>{note.views || 0}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          <button
                            onClick={() => handleView(note._id, note.fileUrl)}
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
                            onClick={() => handleDownload(note._id, note.fileUrl, note.fileName)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                          >
                            <Download size={18} />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => handleRateClick(note)}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                          >
                            <Star size={18} />
                            <span>Rate</span>
                          </button>
                          
                          {/* Admin/Owner Actions */}
                          {(user.role === 'admin' || user.role === 'superadmin' || note.uploadedBy?._id === user._id) && (
                            <>
                              <button
                                onClick={() => handleEdit(note)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                              >
                                <Edit size={18} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(note._id, note.title)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                              >
                                <Trash2 size={18} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reviews Section - Collapsible */}
                    {showReviews[note._id] && (
                      <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Reviews & Ratings
                        </h4>
                        <ReviewsList pdfId={note._id} isDark={isDark} currentUserId={user._id} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        isDark={isDark}
        pdf={selectedPDF}
        onSuccess={handleRatingSuccess}
      />

      <PDFEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        isDark={isDark}
        pdf={editingPDF}
        onSuccess={handleEditSuccess}
      />

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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, FileText, Download, Eye, Star, Calendar,
  User, Edit, Trash2, X, Check, AlertCircle, TrendingUp, Award,
  Shield, Settings, ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import { adminAPI, pdfAPI } from './api';
import PDFEditModal from './PDFEditModal';

export default function ManageNotes() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Data states
  const [pdfs, setPdfs] = useState([]);
  const [uploaders, setUploaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterUploader, setFilterUploader] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selection & Bulk Actions
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Modals
  const [editingPDF, setEditingPDF] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // View state
  const [activeTab, setActiveTab] = useState('all'); // all, analytics
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is admin/superadmin
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin') {
        alert('Access denied. Admin only.');
        navigate('/dashboard');
        return;
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    if (user && activeTab === 'all') {
      fetchPDFs();
      fetchUploaders();
    }
  }, [user, activeTab, searchQuery, filterSemester, filterBranch, filterYear, 
      filterUploader, filterFeatured, filterVerified, sortBy, startDate, endDate]);

  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPDFs({
        search: searchQuery,
        semester: filterSemester,
        branch: filterBranch,
        year: filterYear,
        uploader: filterUploader,
        isFeatured: filterFeatured,
        isVerified: filterVerified,
        sortBy: sortBy,
        startDate: startDate,
        endDate: endDate,
        limit: 100
      });
      
      setPdfs(response.data);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploaders = async () => {
    try {
      const response = await adminAPI.getUploaders();
      setUploaders(response.data);
    } catch (error) {
      console.error('Error fetching uploaders:', error);
    }
  };

  // Selection handlers
  const handleSelectPdf = (pdfId) => {
    setSelectedPdfs(prev => 
      prev.includes(pdfId) 
        ? prev.filter(id => id !== pdfId)
        : [...prev, pdfId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPdfs([]);
    } else {
      setSelectedPdfs(pdfs.map(pdf => pdf._id));
    }
    setSelectAll(!selectAll);
  };

  // Actions
  const handleToggleFeatured = async (pdfId) => {
    try {
      await adminAPI.toggleFeatured(pdfId);
      fetchPDFs();
    } catch (error) {
      alert('Failed to toggle featured status');
    }
  };

  const handleToggleVerified = async (pdfId) => {
    try {
      await adminAPI.toggleVerified(pdfId);
      fetchPDFs();
    } catch (error) {
      alert('Failed to toggle verified status');
    }
  };

  const handleDelete = async (pdfId, pdfTitle) => {
    if (!window.confirm(`Delete "${pdfTitle}"? This cannot be undone.`)) return;

    try {
      await pdfAPI.deletePDF(pdfId);
      fetchPDFs();
    } catch (error) {
      alert('Failed to delete PDF');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPdfs.length === 0) {
      alert('No PDFs selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedPdfs.length} PDF(s)? This cannot be undone.`)) return;

    try {
      await adminAPI.bulkDelete(selectedPdfs);
      setSelectedPdfs([]);
      setSelectAll(false);
      fetchPDFs();
      alert('PDFs deleted successfully');
    } catch (error) {
      alert('Failed to delete PDFs');
    }
  };

  const handleBulkUpdate = async (updates) => {
    if (selectedPdfs.length === 0) {
      alert('No PDFs selected');
      return;
    }

    try {
      await adminAPI.bulkUpdate(selectedPdfs, updates);
      setSelectedPdfs([]);
      setSelectAll(false);
      fetchPDFs();
      alert('PDFs updated successfully');
    } catch (error) {
      alert('Failed to update PDFs');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterSemester('');
    setFilterBranch('');
    setFilterYear('');
    setFilterUploader('');
    setFilterFeatured('');
    setFilterVerified('');
    setSortBy('recent');
    setStartDate('');
    setEndDate('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const activeFiltersCount = [
    searchQuery, filterSemester, filterBranch, filterYear,
    filterUploader, filterFeatured, filterVerified, startDate, endDate
  ].filter(Boolean).length;

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
                <h1
                className={`text-2xl font-bold flex items-center space-x-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <Settings className="text-blue-500" size={28} />
                  <span>Manage Notes</span>
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Admin Dashboard - Full Control Panel
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className={`flex space-x-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} p-1 rounded-lg`}>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'all'
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 shadow'
                    : isDark
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                <FileText className="inline mr-2" size={18} />
                All PDFs
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'analytics'
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 shadow'
                    : isDark
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                <BarChart3 className="inline mr-2" size={18} />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'all' ? (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="text-blue-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalPDFs}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total PDFs
                  </p>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <Download className="text-green-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalDownloads}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Downloads
                  </p>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="text-purple-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalViews}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Views
                  </p>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <Star className="text-yellow-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.avgRating?.toFixed(1) || 0}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg Rating
                  </p>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-orange-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.featuredCount}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Featured
                  </p>
                </div>

                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="text-cyan-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.verifiedCount}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Verified
                  </p>
                </div>
              </div>
            )}

            {/* Filters Section */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Filter size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className={`text-sm px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                        isDark
                          ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <X size={14} />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} size={20} />
                    <input
                      type="text"
                      placeholder="Search by title, description, or filename..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                    />
                  </div>

                  {/* Filter Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none`}
                    >
                      <option value="">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>

                    <select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none`}
                    >
                      <option value="">All Branches</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="IT">IT</option>
                      <option value="LIBERAL_ARTS">Liberal Arts</option>
                      <option value="OTHER">Other</option>
                    </select>

                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none`}
                    >
                      <option value="">All Years</option>
                      {[1, 2, 3, 4].map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>

                    <select
                      value={filterUploader}
                      onChange={(e) => setFilterUploader(e.target.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none`}
                    >
                      <option value="">All Uploaders</option>
                      {uploaders.map(uploader => (
                        <option key={uploader._id} value={uploader._id}>
                          {uploader.name} ({uploader.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none`}
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="downloads">Most Downloads</option>
                      <option value="views">Most Views</option>
                      <option value="rating">Highest Rated</option>
                    </select>

                    <select
                      value={filterFeatured}
                      onChange={(e) => setFilterFeatured(e.target.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none`}
                    >
                      <option value="">All (Featured)</option>
                      <option value="true">Featured Only</option>
                      <option value="false">Not Featured</option>
                    </select>

                    <select
                      value={filterVerified}
                      onChange={(e) => setFilterVerified(e.target.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none`}
                    >
                      <option value="">All (Verified)</option>
                      <option value="true">Verified Only</option>
                      <option value="false">Not Verified</option>
                    </select>

                    <div className="relative">
                        <label className={`absolute -top-2 left-3 px-1 text-xs font-medium ${
                            isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
                        }`}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                            isDark
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none`}
                        />
                        </div>

                        <div className="relative">
                        <label className={`absolute -top-2 left-3 px-1 text-xs font-medium ${
                            isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
                        }`}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                            isDark
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none`}
                        />
                        </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selection & Bulk Actions */}
            {selectedPdfs.length > 0 && (
              <div className={`${isDark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-300'} border-2 rounded-xl p-4 mb-6`}>
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    {selectedPdfs.length} PDF(s) selected
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className={`px-4 py-2 rounded-lg transition-all font-medium ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Bulk Actions
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
                    >
                      <Trash2 size={18} className="inline mr-2" />
                      Delete Selected
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPdfs([]);
                        setSelectAll(false);
                      }}
                      className={`px-4 py-2 rounded-lg transition-all font-medium ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {showBulkActions && (
                  <div className="mt-4 pt-4 border-t border-blue-500/30 space-y-3">
                    <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                      Apply to selected PDFs:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleBulkUpdate({ isFeatured: true })}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
                      >
                        Mark as Featured
                      </button>
                      <button
                        onClick={() => handleBulkUpdate({ isFeatured: false })}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                      >
                        Remove Featured
                      </button>
                      <button
                        onClick={() => handleBulkUpdate({ isVerified: true })}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                      >
                        Mark as Verified
                      </button>
                      <button
                        onClick={() => handleBulkUpdate({ isVerified: false })}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                      >
                        Remove Verified
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing <span className="font-bold text-blue-500">{pdfs.length}</span> PDF(s)
              </p>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select All
                </span>
              </label>
            </div>

            {/* PDF List */}
            {loading ? (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading PDFs...</p>
              </div>
            ) : pdfs.length === 0 ? (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
                <AlertCircle className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={64} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No PDFs found matching your filters
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf._id}
                    className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 hover:shadow-xl transition-all`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedPdfs.includes(pdf._id)}
                        onChange={() => handleSelectPdf(pdf._id)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      {/* PDF Icon */}
                      <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-lg flex-shrink-0">
                        <FileText className="text-white" size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {pdf.title}
                              </h3>
                              {pdf.isFeatured && (
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full border border-orange-500/50">
                                  FEATURED
                                </span>
                              )}
                              {pdf.isVerified && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/50">
                                  VERIFIED
                                </span>
                              )}
                            </div>

                            {pdf.description && (
                              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {pdf.description}
                              </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <User size={16} />
                                <span>{pdf.uploadedBy?.name || 'Unknown'}</span>
                                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                  pdf.uploadedBy?.role === 'superadmin'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {pdf.uploadedBy?.role}
                                </span>
                              </div>
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Calendar size={16} />
                                <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <FileText size={16} />
                                <span>{formatFileSize(pdf.fileSize)}</span>
                              </div>
                              <div className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                Sem {pdf.semester} • {pdf.branch} • Year {pdf.year}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-4 text-sm mt-3">
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                <Star size={16} fill="currentColor" />
                                <span className="font-semibold">{pdf.averageRating || 0}</span>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>({pdf.totalRatings || 0})</span>
                              </div>
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                <Download size={16} />
                                <span>{pdf.downloads || 0}</span>
                              </div>
                              <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Eye size={16} />
                                <span>{pdf.views || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handleToggleFeatured(pdf._id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                pdf.isFeatured
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                  : isDark
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                              title={pdf.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
                            >
                              <TrendingUp size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleVerified(pdf._id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                pdf.isVerified
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : isDark
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                              title={pdf.isVerified ? 'Unverify' : 'Verify'}
                            >
                              <Shield size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingPDF(pdf);
                                setShowEditModal(true);
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(pdf._id, pdf.title)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Analytics Tab */
          <AnalyticsView isDark={isDark} />
        )}
      </main>

      {/* Edit Modal */}
      <PDFEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPDF(null);
        }}
        isDark={isDark}
        pdf={editingPDF}
        onSuccess={() => {
          alert('PDF updated successfully!');
          fetchPDFs();
        }}
      />
    </div>
  );
}

// Analytics Component
function AnalyticsView({ isDark }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
        <AlertCircle className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={64} />
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Failed to load analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Downloaded */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center space-x-2 mb-4">
            <Download className="text-green-500" size={24} />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Top Downloaded
            </h3>
          </div>
          <div className="space-y-3">
            {analytics.topDownloaded.slice(0, 5).map((pdf, index) => (
              <div key={pdf._id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-600' :
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pdf.title}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pdf.semester && `Sem ${pdf.semester}`} • {pdf.branch}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {pdf.downloads}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      downloads
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center space-x-2 mb-4">
            <Star className="text-yellow-500" size={24} fill="currentColor" />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Top Rated
            </h3>
          </div>
          <div className="space-y-3">
            {analytics.topRated.slice(0, 5).map((pdf, index) => (
              <div key={pdf._id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-600' :
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pdf.title}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pdf.semester && `Sem ${pdf.semester}`} • {pdf.branch}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {pdf.averageRating?.toFixed(1)}⭐
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {pdf.totalRatings} reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Viewed */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="text-purple-500" size={24} />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Most Viewed
            </h3>
          </div>
          <div className="space-y-3">
            {analytics.mostViewed.slice(0, 5).map((pdf, index) => (
              <div key={pdf._id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-600' :
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pdf.title}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pdf.semester && `Sem ${pdf.semester}`} • {pdf.branch}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {pdf.views}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      views
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* By Semester */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Distribution by Semester
          </h3>
          <div className="space-y-3">
            {analytics.bySemester.map((sem) => (
              <div key={sem._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Semester {sem._id}
                  </span>
                  <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {sem.count} PDFs
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                    style={{
                      width: `${(sem.count / Math.max(...analytics.bySemester.map(s => s.count))) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {sem.downloads} downloads
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {sem.views} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Branch */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Distribution by Branch
          </h3>
          <div className="space-y-3">
            {analytics.byBranch.map((branch) => (
              <div key={branch._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {branch._id}
                  </span>
                  <span className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {branch.count} PDFs
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{
                      width: `${(branch.count / Math.max(...analytics.byBranch.map(b => b.count))) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    📥 {branch.downloads} downloads
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    👁️ {branch.views} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Uploaders */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Award className="text-cyan-500" size={24} />
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Contributors
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.topUploaders.map((uploader, index) => (
            <div
              key={uploader.user._id}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                }`}>
                  {uploader.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {uploader.user.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {uploader.user.role}
                  </p>
                </div>
                {index < 3 && (
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {uploader.uploadCount}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    uploads
                  </p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {uploader.totalDownloads}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    downloads
                  </p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {uploader.totalViews}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    views
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-xl p-6 border ${isDark ? 'border-blue-500/30' : 'border-blue-200'}`}>
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="text-blue-500" size={24} />
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="font-bold text-blue-500">{analytics.recentUploadCount}</span> PDFs uploaded in the last 30 days
        </p>
      </div>
    </div>
  );
}
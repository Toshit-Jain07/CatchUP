import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Calendar, Star, Edit2, Save, X, Eye, FileText, Trash2
} from 'lucide-react';
import { userAPI, profileAPI } from './api';

export default function ProfilePage() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [stats, setStats] = useState({
    notesUploaded: 0,
    totalViews: 0,
    reviewsGiven: 0,
    avgRating: 0,
    recentActivity: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditedName(parsedUser.name);
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setLoadingStats(true);
        const response = await userAPI.getProfileStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploadingImage(true);

      // Upload to backend
      const response = await profileAPI.uploadProfileImage(file);

      // Update user state
      const updatedUser = {
        ...user,
        profileImage: response.data.profileImage
      };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      setUploadingImage(true);
      await profileAPI.deleteProfileImage();

      // Update user state
      const updatedUser = {
        ...user,
        profileImage: null
      };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile image deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update name via API
      const response = await profileAPI.updateName(editedName);

      // Update user state
      const updatedUser = { ...user, name: response.data.name };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setIsEditing(false);
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

  const getRoleBadge = () => {
    if (user.role === 'superadmin') return { icon: '👑', text: 'Super Admin', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
    if (user.role === 'admin') return { icon: '🛡️', text: 'Admin', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
    return { icon: '👤', text: 'Student', color: 'bg-gray-500/20 text-gray-400 border-gray-500/50' };
  };

  const roleBadge = getRoleBadge();

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      
      {/* Header */}
      <header className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
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
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  My Profile
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your account settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className={`${
              isDark ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl shadow-xl p-8`}>
              
              {/* Profile Picture */}
              <div className="relative mx-auto w-32 h-32 mb-6">
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-blue-500"
                  />
                ) : (
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${getProfileColor()} flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-500`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Camera Button */}
                <label 
                  htmlFor="profile-upload" 
                  className={`absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all shadow-lg ${
                    uploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <Camera size={20} />
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {/* Delete Image Button */}
                {user.profileImage && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={uploadingImage}
                    className={`absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all shadow-lg ${
                      uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Delete profile image"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="text-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className={`w-full text-center text-2xl font-bold mb-2 px-3 py-2 rounded-lg border-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:border-blue-500`}
                  />
                ) : (
                  <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user.name}
                  </h2>
                )}
                
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.email}
                </p>

                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${roleBadge.color}`}>
                  {roleBadge.icon} {roleBadge.text}
                </span>
              </div>

              {/* Edit/Save Buttons */}
              <div className="mt-6 space-y-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium"
                    >
                      <Save size={20} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all font-medium ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      <X size={20} />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
                  >
                    <Edit2 size={20} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Account Info */}
              <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className={isDark ? 'text-gray-400' : 'text-gray-500'} size={18} />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Member since
                      </p>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {loadingStats ? (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading statistics...</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* Reviews Given */}
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                    <div className="flex items-center justify-between mb-2">
                      <Star className="text-yellow-500" size={24} />
                    </div>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.reviewsGiven}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Reviews Given
                    </p>
                  </div>

                  {/* Average Rating Given */}
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                    <div className="flex items-center justify-between mb-2">
                      <Star className="text-yellow-500" fill="currentColor" size={24} />
                    </div>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.avgRating}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Avg Rating Given
                    </p>
                  </div>

                  {/* Notes Uploaded (Admin only) */}
                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <>
                      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                        <div className="flex items-center justify-
                        between mb-2">
                          <FileText className="text-purple-500" size={24} />
                        </div>
                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {stats.notesUploaded}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Notes Uploaded
                        </p>
                      </div>

                      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                        <div className="flex items-center justify-between mb-2">
                          <Eye className="text-blue-500" size={24} />
                        </div>
                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {stats.totalViews}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Views
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Recent Activity */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
                  <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Recent Activity
                  </h3>
                  
                  {stats.recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className={`mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No activity yet. Start reviewing PDFs!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.recentActivity.map((activity) => (
                        <div
                          key={activity._id}
                          className={`flex items-start space-x-4 p-4 rounded-lg ${
                            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="bg-yellow-500/20 p-2 rounded-lg">
                            <Star className="text-yellow-400" size={20} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Reviewed "{activity.pdf?.title || 'PDF'}"
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={`${
                                      star <= activity.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : isDark
                                        ? 'text-gray-600'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                • {getTimeAgo(activity.createdAt)}
                              </span>
                            </div>
                            {activity.review && (
                              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                "{activity.review}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
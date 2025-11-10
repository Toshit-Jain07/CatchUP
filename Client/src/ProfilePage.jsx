import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Mail, User as UserIcon, Shield, 
  Calendar, Download, Star, Edit2, Save, X 
} from 'lucide-react';

export default function ProfilePage() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Mock stats (replace with real data later)
  const stats = {
    notesDownloaded: 47,
    notesUploaded: user?.role !== 'student' ? 23 : 0,
    reviews: 12,
    avgRating: 4.7,
    joinedDate: user?.createdAt || new Date()
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditedName(parsedUser.name);
      
      // Load profile image from localStorage
      const savedImage = localStorage.getItem(`profileImage_${parsedUser._id}`);
      if (savedImage) {
        setImagePreview(savedImage);
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Save to localStorage (in real app, send to backend)
    const updatedUser = { ...user, name: editedName };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    if (profileImage) {
      localStorage.setItem(`profileImage_${user._id}`, profileImage);
    }
    
    setUser(updatedUser);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setIsEditing(false);
    
    // Restore saved image
    const savedImage = localStorage.getItem(`profileImage_${user._id}`);
    setImagePreview(savedImage);
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
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
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
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer transition-all shadow-lg"
                >
                  <Camera size={20} />
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
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
                        {new Date(stats.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Notes Downloaded */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <Download className="text-blue-500" size={24} />
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.notesDownloaded}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Notes Downloaded
                </p>
              </div>

              {/* Notes Uploaded (Admin only) */}
              {user.role !== 'student' && (
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="text-purple-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.notesUploaded}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Notes Uploaded
                  </p>
                </div>
              )}

              {/* Reviews */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <Star className="text-yellow-500" size={24} />
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.reviews}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reviews Given
                </p>
              </div>

              {/* Average Rating */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-2">
                  <Star className="text-yellow-500" fill="currentColor" size={24} />
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.avgRating}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Rating
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                {/* Activity Item */}
                <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Download size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Downloaded "Data Structures - Chapter 5"
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      2 hours ago
                    </p>
                  </div>
                </div>

                <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <Star size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Reviewed "Algorithm Analysis Notes"
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      1 day ago
                    </p>
                  </div>
                </div>

                {user.role !== 'student' && (
                  <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <Shield size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Uploaded "Operating Systems - Week 3"
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        3 days ago
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Past Reviews */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Reviews
              </h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Database Management Systems
                    </p>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    "Excellent notes! Very detailed and well-organized. Helped me ace my exam!"
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    1 week ago
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Computer Networks
                    </p>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    "Good content, but could use more examples."
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    2 weeks ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
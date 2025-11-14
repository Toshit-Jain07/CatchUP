import { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { pdfAPI } from './api';

export default function PDFUploadModal({ isOpen, onClose, isDark }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    semester: '',
    branch: '',
    year: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'LIBERAL_ARTS', 'OTHER'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const years = ['1', '2', '3', '4'];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!file) {
        setError('Please select a PDF file');
        setLoading(false);
        return;
      }

      // Create FormData
      const uploadData = new FormData();
      uploadData.append('pdf', file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('semester', formData.semester);
      uploadData.append('branch', formData.branch);
      uploadData.append('year', formData.year);

      // Upload
      await pdfAPI.uploadPDF(uploadData);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show new PDF
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', semester: '', branch: '', year: '' });
    setFile(null);
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className={`${
        isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-slideUp border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } max-h-[90vh] overflow-y-auto`}>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-all"
        >
          <X className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} size={24} />
        </button>

        {!success ? (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                <Upload className="text-white" size={48} />
              </div>
            </div>

            {/* Title */}
            <h2 className={`text-3xl font-bold text-center mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Upload PDF Notes
            </h2>
            <p className={`text-center mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Share your notes with fellow students
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Data Structures - Complete Notes"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the content..."
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>

              {/* Selects Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Semester */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Semester *
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Branch *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Year *
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none`}
                  >
                    <option value="">Select</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  PDF File * (Max 10MB)
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDark ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer"
                  >
                    <FileText className={`mx-auto mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} size={48} />
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {file ? file.name : 'Click to select PDF file'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      PDF files only, up to 10MB
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full">
                <FileText className="text-white" size={64} />
              </div>
            </div>
            
            <h2 className={`text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Upload Successful! 🎉
            </h2>
            
            <p className={`mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Your PDF has been uploaded successfully and is now available to students.
            </p>

            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Refreshing page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
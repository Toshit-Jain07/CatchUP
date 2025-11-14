import { useState, useEffect } from 'react';
import { X, Edit, FileText } from 'lucide-react';
import { pdfAPI } from './api';

export default function PDFEditModal({ isOpen, onClose, isDark, pdf, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    semester: '',
    branch: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'LIBERAL_ARTS', 'OTHER'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const years = ['1', '2', '3', '4'];

  useEffect(() => {
    if (pdf) {
      setFormData({
        title: pdf.title || '',
        description: pdf.description || '',
        semester: pdf.semester || '',
        branch: pdf.branch || '',
        year: pdf.year || ''
      });
    }
  }, [pdf]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await pdfAPI.updatePDF(pdf._id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !pdf) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className={`${
        isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-slideUp border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } max-h-[90vh] overflow-y-auto`}>
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-all"
        >
          <X className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
            <Edit className="text-white" size={48} />
          </div>
        </div>

        <h2 className={`text-3xl font-bold text-center mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Edit PDF Details
        </h2>
        <p className={`text-center mb-6 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Update information about this PDF
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
            }`}>
              {error}
            </div>
          )}

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
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none`}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Updating...' : 'Update PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
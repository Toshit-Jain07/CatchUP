import { useState, useEffect } from 'react';
import { X, Star, Send } from 'lucide-react';
import { ratingAPI } from './api';

export default function RatingModal({ isOpen, onClose, isDark, pdf, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingRating, setExistingRating] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Fetch existing rating when modal opens
  useEffect(() => {
    const fetchExistingRating = async () => {
      if (!isOpen || !pdf) return;
      
      try {
        setLoadingExisting(true);
        const response = await ratingAPI.getUserRating(pdf._id);
        setExistingRating(response.data);
        setRating(response.data.rating);
        setReview(response.data.review || '');
      } catch (error) {
        // No existing rating found - that's okay
        setExistingRating(null);
        setRating(0);
        setReview('');
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExistingRating();
  }, [isOpen, pdf]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ratingAPI.addRating(pdf._id, { rating, review });
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Rating error:', err);
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setReview('');
    setError('');
    setExistingRating(null);
    onClose();
  };

  if (!isOpen || !pdf) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className={`${
        isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-lg transition-all"
        >
          <X className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} size={24} />
        </button>

        {loadingExisting ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {existingRating ? 'Update Your Review' : 'Rate This PDF'}
              </h2>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {pdf.title}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  {error}
                </div>
              )}

              {/* Star Rating */}
              <div>
                <label className={`block text-sm font-medium mb-3 text-center ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your Rating *
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : isDark
                            ? 'text-gray-600'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <p className={`text-center mt-2 text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {rating === 0 ? 'Select a rating' : 
                   rating === 1 ? 'Poor' :
                   rating === 2 ? 'Fair' :
                   rating === 3 ? 'Good' :
                   rating === 4 ? 'Very Good' :
                   'Excellent'}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows="4"
                  maxLength="500"
                  placeholder="Share your thoughts about this PDF... (max 500 characters)"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
                <p className={`text-xs mt-1 text-right ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {review.length}/500
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || rating === 0}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  (loading || rating === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Send size={20} />
                <span>{loading ? 'Submitting...' : existingRating ? 'Update Review' : 'Submit Review'}</span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleClose}
                className={`w-full py-2 text-sm ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } transition-colors`}
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
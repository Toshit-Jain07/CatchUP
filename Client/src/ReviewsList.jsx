import { useState, useEffect } from 'react';
import { Star, User, Calendar, Trash2 } from 'lucide-react';
import { ratingAPI } from './api';

export default function ReviewsList({ pdfId, isDark, currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [pdfId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getRatings(pdfId);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewPdfId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await ratingAPI.deleteRating(reviewPdfId);
      fetchReviews(); // Refresh list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading reviews...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className={`mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No reviews yet. Be the first to review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className={`p-4 rounded-lg border ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}>
                <User size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {review.user?.name || 'Anonymous'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={`${
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : isDark
                            ? 'text-gray-600'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    •
                  </span>
                  <div className={`flex items-center space-x-1 text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <Calendar size={12} />
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delete button for own reviews */}
            {review.user?._id === currentUserId && (
              <button
                onClick={() => handleDelete(pdfId)}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? 'hover:bg-red-900/30 text-red-400'
                    : 'hover:bg-red-50 text-red-600'
                }`}
                title="Delete your review"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {review.review && (
            <p className={`text-sm mt-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {review.review}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  pdf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDF',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from rating same PDF multiple times
ratingSchema.index({ pdf: 1, user: 1 }, { unique: true });

// Update PDF average rating after saving a rating
ratingSchema.statics.calculateAverageRating = async function(pdfId) {
  const result = await this.aggregate([
    {
      $match: { pdf: pdfId }
    },
    {
      $group: {
        _id: '$pdf',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  try {
    if (result.length > 0) {
      await this.model('PDF').findByIdAndUpdate(pdfId, {
        averageRating: result[0].averageRating.toFixed(1),
        totalRatings: result[0].totalRatings
      });
    } else {
      await this.model('PDF').findByIdAndUpdate(pdfId, {
        averageRating: 0,
        totalRatings: 0
      });
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
};

// Call calculateAverageRating after save
ratingSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.pdf);
});

module.exports = mongoose.model('Rating', ratingSchema);
const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const PDF = require('../models/PDF');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/ratings/:pdfId
// @desc    Add or update rating for a PDF
// @access  Private
router.post('/:pdfId', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { pdfId } = req.params;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }

    // Check if PDF exists
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Check if user already rated this PDF
    let existingRating = await Rating.findOne({
      pdf: pdfId,
      user: req.user._id
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      if (review !== undefined) existingRating.review = review;
      await existingRating.save();

      res.status(200).json({
        success: true,
        message: 'Rating updated successfully',
        data: existingRating
      });
    } else {
      // Create new rating
      const newRating = await Rating.create({
        pdf: pdfId,
        user: req.user._id,
        rating,
        review: review || ''
      });

      await newRating.populate('user', 'name email');

      res.status(201).json({
        success: true,
        message: 'Rating added successfully',
        data: newRating
      });
    }

  } catch (error) {
    console.error('Add Rating Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding rating'
    });
  }
});

// @route   GET /api/ratings/:pdfId
// @desc    Get all ratings for a PDF
// @access  Public
router.get('/:pdfId', async (req, res) => {
  try {
    const ratings = await Rating.find({ pdf: req.params.pdfId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });

  } catch (error) {
    console.error('Get Ratings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ratings'
    });
  }
});

// @route   GET /api/ratings/user/:pdfId
// @desc    Get current user's rating for a PDF
// @access  Private
router.get('/user/:pdfId', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({
      pdf: req.params.pdfId,
      user: req.user._id
    }).populate('user', 'name email');

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'You have not rated this PDF yet'
      });
    }

    res.status(200).json({
      success: true,
      data: rating
    });

  } catch (error) {
    console.error('Get User Rating Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your rating'
    });
  }
});

// @route   DELETE /api/ratings/:pdfId
// @desc    Delete user's rating
// @access  Private
router.delete('/:pdfId', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({
      pdf: req.params.pdfId,
      user: req.user._id
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    await Rating.findByIdAndDelete(rating._id);

    // Recalculate average rating
    await Rating.calculateAverageRating(req.params.pdfId);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });

  } catch (error) {
    console.error('Delete Rating Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting rating'
    });
  }
});

module.exports = router;
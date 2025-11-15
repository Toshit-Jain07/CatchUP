const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users (Super Admin only)
// @access  Private (Super Admin)
router.get('/', protect, superAdminOnly, async(req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id/role', protect, superAdminOnly, async(req, res) => {
    try {
        const { role } = req.body;

        // Validate role
        if (!['student', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be: student, admin, or superadmin'
            });
        }

        // Find user
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent super admin from changing their own role
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        // Update role
        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/users/profile/stats
// @desc    Get current user's profile statistics
// @access  Private
router.get('/profile/stats', protect, async (req, res) => {
  try {
    const PDF = require('../models/PDF');
    const Rating = require('../models/Rating');

    // Get PDFs uploaded by user (if admin/superadmin)
    let notesUploaded = 0;
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      notesUploaded = await PDF.countDocuments({ 
        uploadedBy: req.user._id,
        isActive: true 
      });
    }

    // Get total views for user's uploaded PDFs
    const viewsStats = await PDF.aggregate([
      { $match: { uploadedBy: req.user._id, isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    // Get reviews given by user
    const reviewsGiven = await Rating.countDocuments({ user: req.user._id });

    // Get average rating given by user
    const avgRatingStats = await Rating.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    // Get recent activity (last 10 ratings)
    const recentRatings = await Rating.find({ user: req.user._id })
      .populate('pdf', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        notesUploaded,
        totalViews: viewsStats.length > 0 ? viewsStats[0].totalViews : 0,
        reviewsGiven,
        avgRating: avgRatingStats.length > 0 ? avgRatingStats[0].avgRating.toFixed(1) : 0,
        recentActivity: recentRatings
      }
    });

  } catch (error) {
    console.error('Profile Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile statistics'
    });
  }
});

module.exports = router;

// @route   DELETE /api/users/:id
// @desc    Delete user (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:id', protect, superAdminOnly, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent super admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
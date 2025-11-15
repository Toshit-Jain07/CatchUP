const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { cloudinary, uploadProfileImage } = require('../config/imageUpload');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/profile/upload-image
// @desc    Upload/Update profile image
// @access  Private
router.post('/upload-image', protect, uploadProfileImage.single('profileImage'), async(req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        // Get user
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old image from Cloudinary if exists
        if (user.cloudinaryImageId) {
            try {
                await cloudinary.uploader.destroy(user.cloudinaryImageId);
            } catch (error) {
                console.error('Error deleting old image:', error);
                // Continue even if deletion fails
            }
        }

        // Update user with new image
        user.profileImage = req.file.path;
        user.cloudinaryImageId = req.file.filename;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Upload Profile Image Error:', error);

        // Clean up uploaded file if error occurs
        if (req.file) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Server error during image upload',
            error: error.message
        });
    }
});

// @route   DELETE /api/profile/delete-image
// @desc    Delete profile image
// @access  Private
router.delete('/delete-image', protect, async(req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has a profile image
        if (!user.cloudinaryImageId) {
            return res.status(400).json({
                success: false,
                message: 'No profile image to delete'
            });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(user.cloudinaryImageId);
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with database deletion even if Cloudinary delete fails
        }

        // Update user
        user.profileImage = null;
        user.cloudinaryImageId = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile image deleted successfully'
        });

    } catch (error) {
        console.error('Delete Profile Image Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting image'
        });
    }
});

// @route   PUT /api/profile/update-name
// @desc    Update user name
// @access  Private
router.put('/update-name', protect, async(req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a name'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.name = name.trim();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Name updated successfully',
            data: {
                name: user.name
            }
        });

    } catch (error) {
        console.error('Update Name Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating name'
        });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async(req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user (default role is 'student')
        const user = await User.create({
            name,
            email,
            password,
            role: 'student' // Default role
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Login successful
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async(req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
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

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (simulate email sending)
// @access  Public
router.post('/forgot-password', async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });

        // Don't reveal if user exists or not (security best practice)
        // Always return success message
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, you will receive password reset instructions.'
            });
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign({ id: user._id },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        // In production, you would:
        // 1. Save this token to database with expiry
        // 2. Send email with reset link
        // 3. Link format: https://yourapp.com/reset-password?token=RESET_TOKEN

        // For now, we'll return the token (for development/testing)
        console.log('🔐 Password Reset Token:', resetToken);
        console.log('🔗 Reset Link:', `http://localhost:5173/reset-password?token=${resetToken}`);

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, you will receive password reset instructions.',
            // Remove this in production - only for testing
            devToken: resetToken
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async(req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // Validation
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Find user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

module.exports = router;
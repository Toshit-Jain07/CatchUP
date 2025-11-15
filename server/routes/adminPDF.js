const express = require('express');
const router = express.Router();
const PDF = require('../models/PDF');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { protect, adminOrSuperAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/pdfs
// @desc    Get all PDFs with advanced filters (Admin Dashboard)
// @access  Private (Admin/Super Admin)
router.get('/pdfs', protect, adminOrSuperAdmin, async(req, res) => {
    try {
        const {
            semester,
            branch,
            year,
            search,
            uploader,
            startDate,
            endDate,
            sortBy,
            isFeatured,
            isVerified,
            page = 1,
            limit = 50
        } = req.query;

        // Build filter object
        let filter = {};

        if (semester) filter.semester = semester;
        if (branch) filter.branch = branch;
        if (year) filter.year = year;
        if (uploader) filter.uploadedBy = uploader;
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

        // Search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { fileName: { $regex: search, $options: 'i' } }
            ];
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Sort options
        let sort = {};
        switch (sortBy) {
            case 'downloads':
                sort = { downloads: -1 };
                break;
            case 'views':
                sort = { views: -1 };
                break;
            case 'rating':
                sort = { averageRating: -1, totalRatings: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'recent':
            default:
                sort = { createdAt: -1 };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const pdfs = await PDF.find(filter)
            .populate('uploadedBy', 'name email role')
            .populate('verifiedBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await PDF.countDocuments(filter);

        // Get statistics
        const stats = await PDF.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalPDFs: { $sum: 1 },
                    totalDownloads: { $sum: '$downloads' },
                    totalViews: { $sum: '$views' },
                    avgRating: { $avg: '$averageRating' },
                    featuredCount: {
                        $sum: { $cond: ['$isFeatured', 1, 0] }
                    },
                    verifiedCount: {
                        $sum: { $cond: ['$isVerified', 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: pdfs.length,
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            currentPage: parseInt(page),
            stats: stats[0] || {
                totalPDFs: 0,
                totalDownloads: 0,
                totalViews: 0,
                avgRating: 0,
                featuredCount: 0,
                verifiedCount: 0
            },
            data: pdfs
        });

    } catch (error) {
        console.error('Admin Get PDFs Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching PDFs'
        });
    }
});

// @route   PUT /api/admin/pdfs/:id/toggle-featured
// @desc    Toggle featured status
// @access  Private (Admin/Super Admin)
router.put('/pdfs/:id/toggle-featured', protect, adminOrSuperAdmin, async(req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        pdf.isFeatured = !pdf.isFeatured;
        await pdf.save();

        res.status(200).json({
            success: true,
            message: `PDF ${pdf.isFeatured ? 'marked as featured' : 'unmarked as featured'}`,
            data: { isFeatured: pdf.isFeatured }
        });

    } catch (error) {
        console.error('Toggle Featured Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling featured status'
        });
    }
});

// @route   PUT /api/admin/pdfs/:id/toggle-verified
// @desc    Toggle verified status
// @access  Private (Admin/Super Admin)
router.put('/pdfs/:id/toggle-verified', protect, adminOrSuperAdmin, async(req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        pdf.isVerified = !pdf.isVerified;

        if (pdf.isVerified) {
            pdf.verifiedBy = req.user._id;
            pdf.verifiedAt = new Date();
        } else {
            pdf.verifiedBy = null;
            pdf.verifiedAt = null;
        }

        await pdf.save();
        await pdf.populate('verifiedBy', 'name email');

        res.status(200).json({
            success: true,
            message: `PDF ${pdf.isVerified ? 'verified' : 'unverified'}`,
            data: {
                isVerified: pdf.isVerified,
                verifiedBy: pdf.verifiedBy,
                verifiedAt: pdf.verifiedAt
            }
        });

    } catch (error) {
        console.error('Toggle Verified Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling verified status'
        });
    }
});

// @route   POST /api/admin/pdfs/bulk-delete
// @desc    Delete multiple PDFs
// @access  Private (Admin/Super Admin)
router.post('/pdfs/bulk-delete', protect, adminOrSuperAdmin, async(req, res) => {
    try {
        const { pdfIds } = req.body;

        if (!pdfIds || !Array.isArray(pdfIds) || pdfIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of PDF IDs'
            });
        }

        // Find all PDFs
        const pdfs = await PDF.find({ _id: { $in: pdfIds } });

        if (pdfs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No PDFs found with provided IDs'
            });
        }

        // Delete from Cloudinary
        const cloudinaryDeletePromises = pdfs.map(pdf =>
            cloudinary.uploader.destroy(pdf.cloudinaryId, { resource_type: 'raw' })
            .catch(err => console.error(`Failed to delete ${pdf.cloudinaryId}:`, err))
        );

        await Promise.all(cloudinaryDeletePromises);

        // Delete from database
        await PDF.deleteMany({ _id: { $in: pdfIds } });

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${pdfs.length} PDF(s)`,
            deletedCount: pdfs.length
        });

    } catch (error) {
        console.error('Bulk Delete Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during bulk delete'
        });
    }
});

// @route   POST /api/admin/pdfs/bulk-update
// @desc    Update multiple PDFs (semester, branch, year)
// @access  Private (Admin/Super Admin)
router.post('/pdfs/bulk-update', protect, adminOrSuperAdmin, async(req, res) => {
    try {
        const { pdfIds, updates } = req.body;

        if (!pdfIds || !Array.isArray(pdfIds) || pdfIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of PDF IDs'
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide updates'
            });
        }

        // Validate updates (only allow certain fields)
        const allowedFields = ['semester', 'branch', 'year', 'isFeatured', 'isVerified'];
        const updateData = {};

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = updates[key];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid update fields provided'
            });
        }

        // Update PDFs
        const result = await PDF.updateMany({ _id: { $in: pdfIds } }, { $set: updateData });

        res.status(200).json({
            success: true,
            message: `Successfully updated ${result.modifiedCount} PDF(s)`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk Update Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during bulk update'
        });
    }
});

// @route   GET /api/admin/pdfs/analytics
// @desc    Get analytics data
// @access  Private (Admin/Super Admin)
router.get('/pdfs/analytics', protect, adminOrSuperAdmin, async(req, res) => {
    try {
        // Top downloaded PDFs
        const topDownloaded = await PDF.find({ isActive: true })
            .sort({ downloads: -1 })
            .limit(10)
            .populate('uploadedBy', 'name email')
            .select('title downloads views averageRating totalRatings semester branch');

        // Top rated PDFs
        const topRated = await PDF.find({ isActive: true, totalRatings: { $gte: 5 } })
            .sort({ averageRating: -1, totalRatings: -1 })
            .limit(10)
            .populate('uploadedBy', 'name email')
            .select('title downloads views averageRating totalRatings semester branch');

        // Most viewed PDFs
        const mostViewed = await PDF.find({ isActive: true })
            .sort({ views: -1 })
            .limit(10)
            .populate('uploadedBy', 'name email')
            .select('title downloads views averageRating totalRatings semester branch');

        // PDFs by semester
        const bySemester = await PDF.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$semester',
                    count: { $sum: 1 },
                    downloads: { $sum: '$downloads' },
                    views: { $sum: '$views' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // PDFs by branch
        const byBranch = await PDF.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$branch',
                    count: { $sum: 1 },
                    downloads: { $sum: '$downloads' },
                    views: { $sum: '$views' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Top uploaders
        const topUploaders = await PDF.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$uploadedBy',
                    uploadCount: { $sum: 1 },
                    totalDownloads: { $sum: '$downloads' },
                    totalViews: { $sum: '$views' }
                }
            },
            { $sort: { uploadCount: -1 } },
            { $limit: 10 }
        ]);

        // Populate uploader details
        await User.populate(topUploaders, {
            path: '_id',
            select: 'name email role'
        });

        // Recent uploads (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUploadCount = await PDF.countDocuments({
            isActive: true,
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                topDownloaded,
                topRated,
                mostViewed,
                bySemester,
                byBranch,
                topUploaders: topUploaders.map(u => ({
                    user: u._id,
                    uploadCount: u.uploadCount,
                    totalDownloads: u.totalDownloads,
                    totalViews: u.totalViews
                })),
                recentUploadCount
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics'
        });
    }
});

// @route   GET /api/admin/uploaders
// @desc    Get list of all uploaders (for filter dropdown)
// @access  Private (Admin/Super Admin)
router.get('/uploaders', protect, adminOrSuperAdmin, async(req, res) => {
    try {
        const uploaders = await User.find({
            role: { $in: ['admin', 'superadmin'] }
        }).select('name email role');

        res.status(200).json({
            success: true,
            data: uploaders
        });

    } catch (error) {
        console.error('Get Uploaders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching uploaders'
        });
    }
});

module.exports = router;
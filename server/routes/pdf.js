const express = require('express');
const router = express.Router();
const PDF = require('../models/PDF');
const { cloudinary, upload } = require('../config/cloudinary');
const { protect, adminOrSuperAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/pdfs
// @desc    Get all PDFs (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { semester, branch, year, search } = req.query;

    // Build filter object
    let filter = { isActive: true };

    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (year) filter.year = year;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pdfs = await PDF.find(filter)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pdfs.length,
      data: pdfs
    });

  } catch (error) {
    console.error('Get PDFs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching PDFs'
    });
  }
});
// @route   GET /api/pdfs/download/:id
// @desc    Download PDF file with proper headers
// @access  Public
router.get('/download/:id', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Increment download count
    pdf.downloads += 1;
    await pdf.save();

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.fileName}"`);
    
    // Redirect to Cloudinary URL
    // The browser will download it with the headers we set
    return res.redirect(pdf.fileUrl);

  } catch (error) {
    console.error('Download PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading PDF'
    });
  }
});
// @route   GET /api/pdfs/:id
// @desc    Get single PDF by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id)
      .populate('uploadedBy', 'name email role');

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Increment views
    pdf.views += 1;
    await pdf.save();

    res.status(200).json({
      success: true,
      data: pdf
    });

  } catch (error) {
    console.error('Get PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching PDF'
    });
  }
});

// @route   POST /api/pdfs/upload
// @desc    Upload a new PDF
// @access  Private (Admin & Super Admin only)
router.post('/upload', protect, adminOrSuperAdmin, upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, semester, branch, year } = req.body;

    // Validation
    if (!title || !semester || !branch || !year) {
      // Delete uploaded file if validation fails
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, semester, branch, year'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    // Create PDF document
    const pdf = await PDF.create({
      title,
      description: description || '',
      semester,
      branch,
      year,
      fileUrl: req.file.path,
      cloudinaryId: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user._id
    });

    await pdf.populate('uploadedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: pdf
    });

  } catch (error) {
    console.error('Upload PDF Error:', error);

    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error during PDF upload',
      error: error.message
    });
  }
});

// @route   PUT /api/pdfs/:id
// @desc    Update PDF details (not file)
// @access  Private (Admin/Super Admin or Owner)
router.put('/:id', protect, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Check if user is owner or admin/super-admin
    if (
      pdf.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this PDF'
      });
    }

    const { title, description, semester, branch, year } = req.body;

    if (title) pdf.title = title;
    if (description !== undefined) pdf.description = description;
    if (semester) pdf.semester = semester;
    if (branch) pdf.branch = branch;
    if (year) pdf.year = year;

    await pdf.save();
    await pdf.populate('uploadedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'PDF updated successfully',
      data: pdf
    });

  } catch (error) {
    console.error('Update PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating PDF'
    });
  }
});

// @route   DELETE /api/pdfs/:id
// @desc    Delete PDF
// @access  Private (Admin/Super Admin or Owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Check if user is owner or admin/super-admin
    if (
      pdf.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this PDF'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(pdf.cloudinaryId, { resource_type: 'raw' });
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary delete fails
    }

    // Delete from database
    await PDF.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'PDF deleted successfully'
    });

  } catch (error) {
    console.error('Delete PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting PDF'
    });
  }
});

// @route   PUT /api/pdfs/:id/download
// @desc    Increment download count
// @access  Public
router.put('/:id/download', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    pdf.downloads += 1;
    await pdf.save();

    res.status(200).json({
      success: true,
      message: 'Download count updated',
      downloads: pdf.downloads
    });

  } catch (error) {
    console.error('Increment Download Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating download count'
    });
  }
});

// @route   GET /api/pdfs/stats/overview
// @desc    Get PDF statistics
// @access  Private (Admin & Super Admin)
router.get('/stats/overview', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const totalPDFs = await PDF.countDocuments({ isActive: true });
    const totalDownloads = await PDF.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalViews = await PDF.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPDFs,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
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

// @route   GET /api/pdfs/stats/overview
// @desc    Get PDF statistics
// @access  Private (Admin & Super Admin)
router.get('/stats/overview', protect, adminOrSuperAdmin, async (req, res) => {
  try {
    const totalPDFs = await PDF.countDocuments({ isActive: true });
    const totalViews = await PDF.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPDFs,
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
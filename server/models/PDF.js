const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Please specify semester'],
    enum: ['1', '2', '3', '4', '5', '6', '7', '8']
  },
  branch: {
    type: String,
    required: [true, 'Please specify branch'],
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'OTHER']
  },
  year: {
    type: String,
    required: [true, 'Please specify year'],
    enum: ['1', '2', '3', '4']
  },
  fileUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
pdfSchema.index({ semester: 1, branch: 1, year: 1 });
pdfSchema.index({ uploadedBy: 1 });
pdfSchema.index({ averageRating: -1 });

module.exports = mongoose.model('PDF', pdfSchema);
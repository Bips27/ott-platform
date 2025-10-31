const mongoose = require('mongoose');

const featuredSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // What to show in this section
  contentType: {
    type: String,
    enum: ['movie', 'series'],
    required: true,
  },
  // Link to Category model for dynamic filtering
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

featuredSectionSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('FeaturedSection', featuredSectionSchema);



const mongoose = require('mongoose');

const heroSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  backgroundImage: {
    type: String,
    default: null
  },
  backgroundVideo: {
    type: String,
    default: null
  },
  ctaButton: {
    text: {
      type: String,
      default: 'Play'
    },
    action: {
      type: String,
      enum: ['play', 'more_info'],
      default: 'play'
    },
    link: {
      type: String,
      default: null
    }
  },
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Ensure only one hero section per order
heroSectionSchema.index({ order: 1 }, { unique: true });

// Ensure maximum 5 hero sections
heroSectionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count >= 5) {
      return next(new Error('Maximum 5 hero sections allowed'));
    }
  }
  next();
});

module.exports = mongoose.model('HeroSection', heroSectionSchema);

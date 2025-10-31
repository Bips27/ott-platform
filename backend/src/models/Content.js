const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Content Type & Category
  type: {
    type: String,
    enum: ['movie', 'series', 'episode', 'live', 'documentary', 'short', 'trailer'],
    required: true
  },
  // High-level category used by frontend filters (movies, shows, trailers)
  category: {
    type: String,
    enum: ['movie', 'show', 'trailer', 'other'],
    default: 'other'
  },
  genres: [{
    type: String,
    enum: ['action', 'adventure', 'animation', 'comedy', 'crime', 'documentary', 'drama', 'family', 'fantasy', 'horror', 'mystery', 'romance', 'sci-fi', 'thriller', 'war', 'western']
  }],
  
  // Series Information (for episodes)
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: function() { return this.type === 'episode'; }
  },
  season: {
    type: Number,
    required: function() { return this.type === 'episode'; }
  },
  episode: {
    type: Number,
    required: function() { return this.type === 'episode'; }
  },
  
  // Media Files
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  // Background image used for hero/banner
  backgroundThumbnailUrl: {
    type: String,
    default: null
  },
  posterUrl: {
    type: String,
    default: null
  },
  trailerUrl: {
    type: String,
    default: null
  },
  
  // Video Details
  duration: {
    type: Number, // in seconds
    default: 0
  },
  quality: {
    type: String,
    enum: ['480p', '720p', '1080p', '4K'],
    default: '1080p'
  },
  aspectRatio: {
    type: String,
    default: '16:9'
  },
  fileSize: {
    type: Number, // in bytes
    default: 0
  },
  
  // Subtitles & Audio
  subtitles: [{
    language: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    format: {
      type: String,
      enum: ['srt', 'vtt'],
      default: 'srt'
    }
  }],
  audioTracks: [{
    language: {
      type: String,
      required: true
    },
    codec: {
      type: String,
      default: 'AAC'
    }
  }],
  
  // Content Details
  releaseDate: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'],
    default: 'PG-13'
  },
  ageRestriction: {
    type: Number,
    min: 0,
    max: 21,
    default: 0
  },
  language: {
    type: String,
    default: 'en'
  },
  country: {
    type: String,
    default: 'US'
  },
  
  // Cast & Crew
  cast: [{
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: null
    }
  }],
  director: {
    type: String,
    default: null
  },
  producer: {
    type: String,
    default: null
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  
  // Viewing Statistics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Availability & Access
  isPublished: {
    type: Boolean,
    default: false
  },
  // Soft delete / trash
  isTrashed: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  
  // Homepage Sections
  homepageSections: [{
    type: String,
    enum: ['featured', 'trending', 'new_releases', 'top_picks', 'recommended', 'continue_watching'],
    default: []
  }],
  requiresSubscription: {
    type: Boolean,
    default: true
  },
  allowedPlans: [{
    type: String,
    enum: ['free', 'basic', 'premium', 'family']
  }],
  
  // Geographic Restrictions
  geoRestrictions: {
    allowedCountries: [{
      type: String
    }],
    blockedCountries: [{
      type: String
    }]
  },
  
  // Live Stream Settings (for live content)
  liveStream: {
    isLive: {
      type: Boolean,
      default: false
    },
    scheduledStart: {
      type: Date,
      default: null
    },
    scheduledEnd: {
      type: Date,
      default: null
    },
    streamKey: {
      type: String,
      default: null
    },
    chatEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // SEO & Analytics
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }],
  
  // Admin Information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ isPublished: 1, isFeatured: 1 });
contentSchema.index({ releaseDate: -1 });
contentSchema.index({ views: -1 });
contentSchema.index({ 'rating.average': -1 });
contentSchema.index({ series: 1, season: 1, episode: 1 });

// Virtual for formatted duration
contentSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Virtual for content URL
contentSchema.virtual('contentUrl').get(function() {
  if (this.type === 'episode') {
    return `/series/${this.series}/season/${this.season}/episode/${this.episode}`;
  }
  return `/${this.type}/${this._id}`;
});

// Method to increment views
contentSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to update rating
contentSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Static method to find trending content
contentSchema.statics.findTrending = function(limit = 10) {
  return this.find({ 
    isPublished: true,
    isTrending: true 
  })
  .sort({ views: -1 })
  .limit(limit);
};

// Static method to find content by category
contentSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ 
    category: category,
    isPublished: true 
  })
  .sort({ releaseDate: -1 })
  .limit(limit);
};

// Static method to search content
contentSchema.statics.search = function(query, limit = 20) {
  return this.find({
    $text: { $search: query },
    isPublished: true
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

module.exports = mongoose.model('Content', contentSchema);

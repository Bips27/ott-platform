const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Plan Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Pricing
  price: {
    monthly: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    yearly: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    }
  },
  
  // Plan Features
  features: {
    maxDevices: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 device must be allowed']
    },
    maxProfiles: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 profile must be allowed']
    },
    videoQuality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4K'],
      default: '720p'
    },
    downloadLimit: {
      type: Number,
      default: 0, // 0 means unlimited
      min: [0, 'Download limit cannot be negative']
    },
    offlineViewing: {
      type: Boolean,
      default: false
    },
    adFree: {
      type: Boolean,
      default: false
    },
    exclusiveContent: {
      type: Boolean,
      default: false
    },
    familySharing: {
      type: Boolean,
      default: false
    }
  },
  
  // Content Access
  contentAccess: {
    movies: {
      type: Boolean,
      default: true
    },
    series: {
      type: Boolean,
      default: true
    },
    liveTV: {
      type: Boolean,
      default: false
    },
    documentaries: {
      type: Boolean,
      default: true
    },
    kidsContent: {
      type: Boolean,
      default: false
    },
    premiumContent: {
      type: Boolean,
      default: false
    }
  },
  
  // Plan Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  
  // Trial Settings
  trialDays: {
    type: Number,
    default: 0,
    min: [0, 'Trial days cannot be negative']
  },
  
  // Billing Cycle
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  
  // Payment Integration
  stripePriceId: {
    monthly: {
      type: String,
      default: null
    },
    yearly: {
      type: String,
      default: null
    }
  },
  paypalPlanId: {
    monthly: {
      type: String,
      default: null
    },
    yearly: {
      type: String,
      default: null
    }
  },
  
  // Plan Limits
  limits: {
    maxConcurrentStreams: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 concurrent stream must be allowed']
    },
    maxWatchlistItems: {
      type: Number,
      default: 100,
      min: [10, 'At least 10 watchlist items must be allowed']
    },
    maxHistoryItems: {
      type: Number,
      default: 1000,
      min: [100, 'At least 100 history items must be allowed']
    }
  },
  
  // Geographic Availability
  availableCountries: [{
    type: String,
    trim: true
  }],
  restrictedCountries: [{
    type: String,
    trim: true
  }],
  
  // SEO & Marketing
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  marketingFeatures: [{
    type: String,
    trim: true
  }],
  
  // Admin Information
  createdBy: {
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
subscriptionSchema.index({ name: 1 });
subscriptionSchema.index({ isActive: 1, isPopular: 1 });
subscriptionSchema.index({ 'price.monthly': 1 });
subscriptionSchema.index({ 'price.yearly': 1 });

// Virtual for yearly savings
subscriptionSchema.virtual('yearlySavings').get(function() {
  const monthlyCost = this.price.monthly * 12;
  const yearlyCost = this.price.yearly;
  return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
});

// Virtual for formatted price
subscriptionSchema.virtual('formattedPrice').get(function() {
  return {
    monthly: `$${this.price.monthly}/${this.billingCycle === 'monthly' ? 'month' : 'year'}`,
    yearly: `$${this.price.yearly}/year`
  };
});

// Method to check if plan is available in country
subscriptionSchema.methods.isAvailableInCountry = function(countryCode) {
  if (this.restrictedCountries.includes(countryCode)) {
    return false;
  }
  
  if (this.availableCountries.length === 0) {
    return true; // Available everywhere if no restrictions
  }
  
  return this.availableCountries.includes(countryCode);
};

// Method to get price for billing cycle
subscriptionSchema.methods.getPrice = function(billingCycle) {
  return billingCycle === 'yearly' ? this.price.yearly : this.price.monthly;
};

// Static method to find active plans
subscriptionSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ 'price.monthly': 1 });
};

// Static method to find popular plans
subscriptionSchema.statics.findPopular = function() {
  return this.find({ 
    isActive: true, 
    isPopular: true 
  }).sort({ 'price.monthly': 1 });
};

// Static method to find plans by price range
subscriptionSchema.statics.findByPriceRange = function(minPrice, maxPrice, billingCycle = 'monthly') {
  const priceField = billingCycle === 'yearly' ? 'price.yearly' : 'price.monthly';
  
  return this.find({
    isActive: true,
    [priceField]: { $gte: minPrice, $lte: maxPrice }
  }).sort({ [priceField]: 1 });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);

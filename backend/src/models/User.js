const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: function() { return !this.mobileNumber; },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobileNumber: {
    type: String,
    required: function() { return !this.email; },
    unique: true,
    sparse: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number']
  },
  password: {
    type: String,
    required: function() { return !this.socialLogin && !this.mobileNumber; },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  // Social Login
  socialLogin: {
    type: Boolean,
    default: false
  },
  socialProvider: {
    type: String,
    enum: ['google', 'facebook', 'apple', null],
    default: null
  },
  socialId: {
    type: String,
    default: null
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  
  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'family'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'inactive'
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', null],
      default: null
    },
    customerId: {
      type: String,
      default: null
    }
  },
  
  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    subtitles: {
      type: Boolean,
      default: true
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    quality: {
      type: String,
      enum: ['auto', '1080p', '720p', '480p'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Watch History & Lists
  watchHistory: [{
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // Password Reset
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  // OTP Verification
  otpCode: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ mobileNumber: 1 });
userSchema.index({ socialId: 1, socialProvider: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for subscription status
userSchema.virtual('hasActiveSubscription').get(function() {
  return this.subscription.status === 'active' && 
         this.subscription.endDate > new Date();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.socialId;
  delete userObject.subscription.customerId;
  return userObject;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active subscribers
userSchema.statics.findActiveSubscribers = function() {
  return this.find({
    'subscription.status': 'active',
    'subscription.endDate': { $gt: new Date() }
  });
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
};

// Static method to find by reset token
userSchema.statics.findByResetToken = function(token) {
  return this.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
};

// Static method to find by mobile number
userSchema.statics.findByMobileNumber = function(mobileNumber) {
  return this.findOne({ mobileNumber });
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const crypto = require('crypto');
  const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
  this.otpCode = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp) {
  return this.otpCode === otp && 
         this.otpExpires > Date.now();
};

// Method to clear OTP
userSchema.methods.clearOTP = function() {
  this.otpCode = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model('User', userSchema);

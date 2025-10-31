const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  duration: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'yearly']
  },
  durationMonths: {
    type: Number,
    required: true,
    min: 1
  },
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  stripePriceId: {
    type: String,
    default: null
  },
  stripeProductId: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Indexes
subscriptionPlanSchema.index({ isActive: 1 });
subscriptionPlanSchema.index({ duration: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

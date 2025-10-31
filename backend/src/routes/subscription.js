const express = require('express');
const { body, validationResult } = require('express-validator');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subscription/plans
// @desc    Get all active subscription plans
// @access  Public
router.get('/plans', asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true })
    .sort({ durationMonths: 1, price: 1 });
  
  res.json({
    success: true,
    data: plans
  });
}));

// @route   GET /api/subscription/user-status
// @desc    Get current user's subscription status
// @access  Private
router.get('/user-status', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const hasActiveSubscription = user.subscription.status === 'active' && 
    user.subscription.endDate > new Date();

  res.json({
    success: true,
    data: {
      hasActiveSubscription,
      subscription: user.subscription,
      user: user.getPublicProfile()
    }
  });
}));

// @route   POST /api/subscription/create-checkout-session
// @desc    Create Stripe checkout session for subscription
// @access  Private
router.post('/create-checkout-session', [
  authMiddleware,
  body('planId').notEmpty().withMessage('Plan ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { planId } = req.body;
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Subscription plan not found'
    });
  }

  // In a real app, you would integrate with Stripe here
  // For now, we'll simulate a successful checkout session
  const checkoutSessionId = `cs_test_${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      checkoutSessionId,
      plan: plan,
      message: 'Checkout session created successfully'
    }
  });
}));

// @route   POST /api/subscription/webhook
// @desc    Handle Stripe webhook events
// @access  Public (but should verify Stripe signature)
router.post('/webhook', asyncHandler(async (req, res) => {
  // In a real app, you would verify the Stripe signature here
  const event = req.body;
  
  console.log('Received webhook event:', event.type);
  
  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful subscription
      console.log('Checkout session completed');
      break;
    case 'invoice.payment_succeeded':
      // Handle successful payment
      console.log('Payment succeeded');
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      console.log('Subscription cancelled');
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
}));

// @route   POST /api/subscription/cancel
// @desc    Cancel user's subscription
// @access  Private
router.post('/cancel', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update subscription status
  user.subscription.status = 'cancelled';
  user.subscription.autoRenew = false;
  await user.save();

  res.json({
    success: true,
    message: 'Subscription cancelled successfully'
  });
}));

// @route   POST /api/subscription/reactivate
// @desc    Reactivate user's subscription
// @access  Private
router.post('/reactivate', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update subscription status
  user.subscription.status = 'active';
  user.subscription.autoRenew = true;
  await user.save();

  res.json({
    success: true,
    message: 'Subscription reactivated successfully'
  });
}));

module.exports = router;

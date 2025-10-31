const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get user's subscription
router.get('/', subscriptionController.getUserSubscription);

// Create checkout session for subscription
router.post('/checkout', subscriptionController.createCheckoutSession);

// Handle successful subscription
router.post('/success', subscriptionController.handleSubscriptionSuccess);

// Cancel subscription
router.delete('/', subscriptionController.cancelSubscription);

// Update subscription plan
router.put('/plan', subscriptionController.updateSubscriptionPlan);

// Get payment methods
router.get('/payment-methods', subscriptionController.getPaymentMethods);

// Create setup intent for adding payment method
router.post('/setup-intent', subscriptionController.createSetupIntent);

module.exports = router;

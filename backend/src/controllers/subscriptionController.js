const stripeService = require('../services/stripeService');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorHandler');

// Create checkout session for subscription
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { priceId, plan } = req.body;
  const userId = req.user.id;

  // Validate plan
  const validPlans = ['basic', 'premium', 'family'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid subscription plan'
    });
  }

  try {
    // Get or create Stripe customer
    let customerId = req.user.subscription.customerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(req.user);
      customerId = customer.id;
      
      // Update user with customer ID
      await User.findByIdAndUpdate(userId, {
        'subscription.customerId': customerId
      });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      priceId,
      customerId,
      `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.FRONTEND_URL}/plans`
    );

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
});

// Handle successful subscription
const handleSubscriptionSuccess = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;

  try {
    // Retrieve session from Stripe
    const session = await stripeService.stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Get subscription details
      const subscription = await stripeService.getSubscription(session.subscription);
      
      // Determine plan based on price
      let plan = 'basic';
      const priceId = session.metadata.priceId;
      
      // Map price IDs to plans (you'll need to set these up in Stripe)
      const priceToPlan = {
        'price_basic_monthly': 'basic',
        'price_basic_yearly': 'basic',
        'price_premium_monthly': 'premium',
        'price_premium_yearly': 'premium',
        'price_family_monthly': 'family',
        'price_family_yearly': 'family',
      };
      
      plan = priceToPlan[priceId] || 'basic';

      // Update user subscription
      const subscriptionData = {
        plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(subscription.current_period_end * 1000),
        autoRenew: true,
        paymentMethod: 'stripe',
        customerId: session.customer
      };

      await User.findByIdAndUpdate(userId, {
        subscription: subscriptionData
      });

      // Create subscription record
      await Subscription.findOneAndUpdate(
        { userId },
        {
          userId,
          stripeSubscriptionId: subscription.id,
          plan,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(subscription.current_period_end * 1000),
          amount: subscription.items.data[0].price.unit_amount / 100,
          currency: subscription.currency,
          interval: subscription.items.data[0].price.recurring.interval
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: 'Subscription activated successfully',
        data: {
          subscription: subscriptionData
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Error handling subscription success:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process subscription'
    });
  }
});

// Get user subscription
const getUserSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.json({
        success: true,
        data: {
          subscription: null,
          message: 'No active subscription found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription'
    });
  }
});

// Cancel subscription
const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel in Stripe
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    // Update local records
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'cancelled',
      'subscription.autoRenew': false
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Update subscription plan
const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const { newPlan, newPriceId } = req.body;
  const userId = req.user.id;

  try {
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Update in Stripe
    const updatedSubscription = await stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      newPriceId
    );

    // Update local records
    await Subscription.findByIdAndUpdate(subscription._id, {
      plan: newPlan,
      amount: updatedSubscription.items.data[0].price.unit_amount / 100,
      interval: updatedSubscription.items.data[0].price.recurring.interval
    });

    await User.findByIdAndUpdate(userId, {
      'subscription.plan': newPlan
    });

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: {
        subscription: updatedSubscription
      }
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription plan'
    });
  }
});

// Get payment methods
const getPaymentMethods = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    
    if (!user.subscription.customerId) {
      return res.json({
        success: true,
        data: {
          paymentMethods: []
        }
      });
    }

    const paymentMethods = await stripeService.getPaymentMethods(user.subscription.customerId);

    res.json({
      success: true,
      data: {
        paymentMethods: paymentMethods.data
      }
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods'
    });
  }
});

// Create setup intent for adding payment method
const createSetupIntent = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    
    if (!user.subscription.customerId) {
      // Create customer first
      const customer = await stripeService.createCustomer(user);
      await User.findByIdAndUpdate(userId, {
        'subscription.customerId': customer.id
      });
    }

    const setupIntent = await stripeService.createSetupIntent(user.subscription.customerId);

    res.json({
      success: true,
      data: {
        clientSecret: setupIntent.client_secret
      }
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create setup intent'
    });
  }
});

module.exports = {
  createCheckoutSession,
  handleSubscriptionSuccess,
  getUserSubscription,
  cancelSubscription,
  updateSubscriptionPlan,
  getPaymentMethods,
  createSetupIntent
};

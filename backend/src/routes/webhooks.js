const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeService.verifyWebhookSignature(req.body, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  try {
    const customer = await stripeService.stripe.customers.retrieve(subscription.customer);
    const user = await User.findOne({ 'subscription.customerId': customer.id });
    
    if (user) {
      // Update user subscription
      await User.findByIdAndUpdate(user._id, {
        'subscription.status': 'active',
        'subscription.startDate': new Date(subscription.current_period_start * 1000),
        'subscription.endDate': new Date(subscription.current_period_end * 1000),
        'subscription.autoRenew': true
      });

      // Create or update subscription record
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          stripeSubscriptionId: subscription.id,
          plan: 'premium', // You might want to determine this from the price
          status: 'active',
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
          amount: subscription.items.data[0].price.unit_amount / 100,
          currency: subscription.currency,
          interval: subscription.items.data[0].price.recurring.interval
        },
        { upsert: true, new: true }
      );

      console.log(`Subscription created for user ${user.email}`);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    const customer = await stripeService.stripe.customers.retrieve(subscription.customer);
    const user = await User.findOne({ 'subscription.customerId': customer.id });
    
    if (user) {
      // Update user subscription
      await User.findByIdAndUpdate(user._id, {
        'subscription.status': subscription.status === 'active' ? 'active' : 'inactive',
        'subscription.endDate': new Date(subscription.current_period_end * 1000)
      });

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          status: subscription.status === 'active' ? 'active' : 'inactive',
          endDate: new Date(subscription.current_period_end * 1000),
          amount: subscription.items.data[0].price.unit_amount / 100
        }
      );

      console.log(`Subscription updated for user ${user.email}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    const customer = await stripeService.stripe.customers.retrieve(subscription.customer);
    const user = await User.findOne({ 'subscription.customerId': customer.id });
    
    if (user) {
      // Update user subscription
      await User.findByIdAndUpdate(user._id, {
        'subscription.status': 'cancelled',
        'subscription.autoRenew': false
      });

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      );

      console.log(`Subscription cancelled for user ${user.email}`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle payment succeeded
async function handlePaymentSucceeded(invoice) {
  try {
    const customer = await stripeService.stripe.customers.retrieve(invoice.customer);
    const user = await User.findOne({ 'subscription.customerId': customer.id });
    
    if (user) {
      // Update subscription end date
      const subscription = await stripeService.getSubscription(invoice.subscription);
      
      await User.findByIdAndUpdate(user._id, {
        'subscription.endDate': new Date(subscription.current_period_end * 1000)
      });

      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          endDate: new Date(subscription.current_period_end * 1000),
          lastPaymentDate: new Date()
        }
      );

      console.log(`Payment succeeded for user ${user.email}`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// Handle payment failed
async function handlePaymentFailed(invoice) {
  try {
    const customer = await stripeService.stripe.customers.retrieve(invoice.customer);
    const user = await User.findOne({ 'subscription.customerId': customer.id });
    
    if (user) {
      // You might want to send an email notification here
      console.log(`Payment failed for user ${user.email}`);
      
      // Optionally update subscription status
      await User.findByIdAndUpdate(user._id, {
        'subscription.status': 'inactive'
      });
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

module.exports = router;

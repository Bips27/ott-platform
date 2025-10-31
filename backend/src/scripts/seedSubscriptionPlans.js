const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/SubscriptionPlan');
require('dotenv').config();

const seedSubscriptionPlans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Create default subscription plans
    const plans = [
      {
        name: 'Basic',
        description: 'Perfect for casual viewers',
        price: 9.99,
        currency: 'USD',
        duration: 'monthly',
        durationMonths: 1,
        features: [
          'HD streaming',
          'Access to basic content library',
          'Watch on 1 device',
          'Cancel anytime'
        ],
        isActive: true,
        isPopular: false
      },
      {
        name: 'Standard',
        description: 'Most popular choice for families',
        price: 15.99,
        currency: 'USD',
        duration: 'monthly',
        durationMonths: 1,
        features: [
          'Full HD streaming',
          'Access to complete content library',
          'Watch on 2 devices simultaneously',
          'Download for offline viewing',
          'Cancel anytime'
        ],
        isActive: true,
        isPopular: true
      },
      {
        name: 'Premium',
        description: 'Ultimate viewing experience',
        price: 19.99,
        currency: 'USD',
        duration: 'monthly',
        durationMonths: 1,
        features: [
          '4K Ultra HD streaming',
          'Access to complete content library',
          'Watch on 4 devices simultaneously',
          'Download for offline viewing',
          'Premium content access',
          'Cancel anytime'
        ],
        isActive: true,
        isPopular: false
      },
      {
        name: 'Standard Quarterly',
        description: 'Save 15% with quarterly billing',
        price: 40.77, // 15.99 * 3 * 0.85
        currency: 'USD',
        duration: 'quarterly',
        durationMonths: 3,
        features: [
          'Full HD streaming',
          'Access to complete content library',
          'Watch on 2 devices simultaneously',
          'Download for offline viewing',
          'Save 15% compared to monthly',
          'Cancel anytime'
        ],
        isActive: true,
        isPopular: false
      },
      {
        name: 'Premium Yearly',
        description: 'Best value - Save 25% with yearly billing',
        price: 179.88, // 19.99 * 12 * 0.75
        currency: 'USD',
        duration: 'yearly',
        durationMonths: 12,
        features: [
          '4K Ultra HD streaming',
          'Access to complete content library',
          'Watch on 4 devices simultaneously',
          'Download for offline viewing',
          'Premium content access',
          'Save 25% compared to monthly',
          'Cancel anytime'
        ],
        isActive: true,
        isPopular: false
      }
    ];

    // Insert plans
    const createdPlans = await SubscriptionPlan.insertMany(plans);
    console.log(`✅ Created ${createdPlans.length} subscription plans`);

    // Display created plans
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/${plan.duration} (${plan.durationMonths} months)`);
    });

  } catch (error) {
    console.error('Error seeding subscription plans:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedSubscriptionPlans();

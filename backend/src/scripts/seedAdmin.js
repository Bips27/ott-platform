const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@ottplatform.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      console.log('Email: admin@ottplatform.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@ottplatform.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      subscription: {
        plan: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        autoRenew: true
      }
    });

    await adminUser.save();

    console.log('🎉 Admin user created successfully!');
    console.log('Email: admin@ottplatform.com');
    console.log('Password: admin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
};

// Run the script
createAdminUser();

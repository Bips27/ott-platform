const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is blocked. Please contact support.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

// Middleware to check if user has admin role
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required.' 
    });
  }

  next();
};

// Middleware to check if user has moderator or admin role
const moderatorMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Moderator or admin access required.' 
    });
  }

  next();
};

// Middleware to check if user has active subscription
const subscriptionMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  // Check if user has active subscription
  if (!req.user.hasActiveSubscription) {
    return res.status(403).json({ 
      success: false, 
      message: 'Active subscription required.' 
    });
  }

  next();
};

// Middleware to check if user has specific subscription plan
const planMiddleware = (requiredPlan) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    // Check if user has required plan
    if (req.user.subscription.plan !== requiredPlan && req.user.subscription.plan !== 'premium') {
      return res.status(403).json({ 
        success: false, 
        message: `${requiredPlan} plan or higher required.` 
      });
    }

    next();
  };
};

// Middleware to check if user has verified email
const emailVerifiedMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Email verification required.' 
    });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive && !user.isBlocked) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  moderatorMiddleware,
  subscriptionMiddleware,
  planMiddleware,
  emailVerifiedMiddleware,
  optionalAuthMiddleware
};

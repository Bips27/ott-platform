const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const User = require('../models/User');
const Category = require('../models/Category');
const FeaturedSection = require('../models/FeaturedSection');
const HeroSection = require('../models/HeroSection');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { adminMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// All admin routes require admin role
router.use(adminMiddleware);

// Get all users (admin only)
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password -resetPasswordToken -resetPasswordExpires')
    .populate('subscription.plan', 'name price duration')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: users });
}));

// Block/Unblock user
router.put('/users/:id/block', asyncHandler(async (req, res) => {
  const { isBlocked } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked },
    { new: true }
  ).select('-password -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ success: true, data: user });
}));

// Change user role
router.put('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ success: true, data: user });
}));

// Get user analytics
router.get('/users/analytics', asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true, isBlocked: false });
  const blockedUsers = await User.countDocuments({ isBlocked: true });
  const subscribers = await User.countDocuments({ 'subscription.status': 'active' });
  
  const recentUsers = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      blockedUsers,
      subscribers,
      recentUsers
    }
  });
}));

// Get all content (admin only)
router.get('/content', async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Categories CRUD
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const cat = await Category.create({
      name: req.body.name,
      contentType: req.body.contentType
    });
    res.status(201).json({ success: true, data: cat });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, contentType: req.body.contentType, isActive: req.body.isActive !== false },
      { new: true }
    );
    res.json({ success: true, data: cat });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Featured Sections CRUD
router.get('/featured-sections', async (req, res) => {
  try {
    const sections = await FeaturedSection.find({ isActive: true })
      .populate('category')
      .sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/featured-sections', async (req, res) => {
  try {
    const count = await FeaturedSection.countDocuments();
    const section = await FeaturedSection.create({
      name: req.body.name,
      contentType: req.body.contentType,
      category: req.body.categoryId,
      order: typeof req.body.order === 'number' ? req.body.order : count,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/featured-sections/:id', async (req, res) => {
  try {
    const section = await FeaturedSection.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        contentType: req.body.contentType,
        category: req.body.categoryId,
        order: req.body.order,
        isActive: req.body.isActive !== false
      },
      { new: true }
    );
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/featured-sections/:id', async (req, res) => {
  try {
    await FeaturedSection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create content (admin only)
router.post('/content', async (req, res) => {
  try {
    const body = req.body;
    const payload = {
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription || body.description?.slice(0, 140) || '',
      // map UI fields to model fields
      type: body.type || (body.category === 'trailer' ? 'trailer' : (body.category === 'show' ? 'series' : 'movie')),
      category: body.category || (body.type === 'trailer' ? 'trailer' : body.type === 'series' ? 'show' : 'movie'),
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnail || body.thumbnailUrl,
      backgroundThumbnailUrl: body.backgroundThumbnailUrl || body.background || null,
      posterUrl: body.posterUrl || body.thumbnail || body.thumbnailUrl,
      trailerUrl: body.trailerUrl || null,
      duration: body.duration ? Number(body.duration) : 0,
      quality: body.quality || '1080p',
      releaseDate: body.releaseDate || new Date(),
      rating: body.rating || 'PG-13',
      homepageSections: body.homepageSections || [],
      uploadedBy: req.user._id,
      isPublished: true,
      director: body.director || null,
      cast: Array.isArray(body.cast) ? body.cast : undefined
    };

    const content = new Content(payload);
    await content.save();
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk create content (admin only)
router.post('/content/bulk', async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    const payloads = items.map((body) => ({
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription || body.description?.slice(0, 140) || '',
      type: body.type || (body.category === 'trailer' ? 'trailer' : (body.category === 'show' ? 'series' : 'movie')),
      category: body.category || (body.type === 'trailer' ? 'trailer' : body.type === 'series' ? 'show' : 'movie'),
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnail || body.thumbnailUrl,
      backgroundThumbnailUrl: body.backgroundThumbnailUrl || body.background || null,
      posterUrl: body.posterUrl || body.thumbnail || body.thumbnailUrl,
      trailerUrl: body.trailerUrl || null,
      duration: body.duration ? Number(body.duration) : 0,
      quality: body.quality || '1080p',
      releaseDate: body.releaseDate || new Date(),
      rating: body.rating || 'PG-13',
      homepageSections: body.homepageSections || [],
      director: body.director || null,
      cast: Array.isArray(body.cast) ? body.cast : [],
      uploadedBy: req.user._id,
      isPublished: true
    }));

    const Content = require('../models/Content');
    const created = await Content.insertMany(payloads, { ordered: false });
    res.status(201).json({ success: true, data: { inserted: created.length } });
  } catch (error) {
    console.error('Bulk create content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update content (admin only)
router.put('/content/:id', async (req, res) => {
  try {
    const body = req.body;
    const update = {
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription,
      type: body.type || (body.category === 'trailer' ? 'trailer' : (body.category === 'show' ? 'series' : 'movie')),
      category: body.category || (body.type === 'trailer' ? 'trailer' : body.type === 'series' ? 'show' : 'movie'),
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnail || body.thumbnailUrl,
      backgroundThumbnailUrl: body.backgroundThumbnailUrl || body.background,
      posterUrl: body.posterUrl || body.thumbnail || body.thumbnailUrl,
      trailerUrl: body.trailerUrl,
      duration: body.duration ? Number(body.duration) : undefined,
      quality: body.quality,
      releaseDate: body.releaseDate,
      rating: body.rating,
      homepageSections: body.homepageSections || [],
      lastModifiedBy: req.user._id,
      director: body.director,
      cast: Array.isArray(body.cast) ? body.cast : undefined
    };

    const content = await Content.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content (admin only)
router.delete('/content/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk actions on content
router.post('/content/bulk-action', async (req, res) => {
  try {
    const { ids = [], action } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'No ids provided' });
    }
    const Content = require('../models/Content');
    let update = {};
    switch (action) {
      case 'draft':
        update = { isPublished: false };
        break;
      case 'publish':
        update = { isPublished: true };
        break;
      case 'trash':
        update = { isTrashed: true };
        break;
      case 'delete':
        await Content.deleteMany({ _id: { $in: ids } });
        return res.json({ success: true, data: { deleted: ids.length } });
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    const result = await Content.updateMany({ _id: { $in: ids } }, { $set: update });
    res.json({ success: true, data: { modified: result.modifiedCount || 0 } });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Hero Sections CRUD
router.get('/hero-sections', async (req, res) => {
  try {
    const heroSections = await HeroSection.find({ isActive: true })
      .populate('content', 'title thumbnailUrl backgroundThumbnailUrl videoUrl trailerUrl')
      .populate('createdBy', 'name email')
      .sort({ order: 1 });
    res.json({ success: true, data: heroSections });
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/hero-sections', async (req, res) => {
  try {
    const { title, subtitle, description, contentId, backgroundImage, backgroundVideo, ctaButton, order } = req.body;
    
    // Validate required fields
    if (!title || !contentId || !order) {
      return res.status(400).json({ message: 'Title, content, and order are required' });
    }

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if order is already taken
    const existingHero = await HeroSection.findOne({ order });
    if (existingHero) {
      return res.status(400).json({ message: 'Order already taken' });
    }

    const heroSection = await HeroSection.create({
      title,
      subtitle,
      description,
      content: contentId,
      backgroundImage: backgroundImage || content.backgroundThumbnailUrl || content.thumbnailUrl,
      backgroundVideo: backgroundVideo || content.trailerUrl,
      ctaButton: ctaButton || { text: 'Play', action: 'play' },
      order,
      createdBy: req.user._id
    });

    await heroSection.populate('content', 'title thumbnailUrl backgroundThumbnailUrl videoUrl trailerUrl');
    res.status(201).json({ success: true, data: heroSection });
  } catch (error) {
    console.error('Error creating hero section:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Order already taken' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

router.put('/hero-sections/:id', async (req, res) => {
  try {
    const { title, subtitle, description, contentId, backgroundImage, backgroundVideo, ctaButton, order, isActive } = req.body;
    
    const updateData = {
      title,
      subtitle,
      description,
      backgroundImage,
      backgroundVideo,
      ctaButton,
      order,
      isActive,
      lastModifiedBy: req.user._id
    };

    if (contentId) {
      const content = await Content.findById(contentId);
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      updateData.content = contentId;
    }

    const heroSection = await HeroSection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('content', 'title thumbnailUrl backgroundThumbnailUrl videoUrl trailerUrl');

    if (!heroSection) {
      return res.status(404).json({ message: 'Hero section not found' });
    }

    res.json({ success: true, data: heroSection });
  } catch (error) {
    console.error('Error updating hero section:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Order already taken' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

router.delete('/hero-sections/:id', async (req, res) => {
  try {
    const heroSection = await HeroSection.findByIdAndDelete(req.params.id);
    if (!heroSection) {
      return res.status(404).json({ message: 'Hero section not found' });
    }
    res.json({ success: true, message: 'Hero section deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero section:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Categories CRUD
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('createdBy', 'name email')
    .sort({ name: 1 });
  res.json({ success: true, data: categories });
}));

router.post('/categories', asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const category = await Category.create({
    name: name.trim(),
    description: description?.trim(),
    color: color || '#E50914',
    createdBy: req.user._id
  });

  await category.populate('createdBy', 'name email');
  res.status(201).json({ success: true, data: category });
}));

router.put('/categories/:id', asyncHandler(async (req, res) => {
  const { name, description, color, isActive } = req.body;
  
  const updateData = { 
    description: description?.trim(), 
    color, 
    isActive, 
    lastModifiedBy: req.user._id 
  };

  if (name && name.trim()) {
    updateData.name = name.trim();
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id, updateData, { new: true }
  ).populate('createdBy', 'name email');

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json({ success: true, data: category });
}));

router.delete('/categories/:id', asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json({ success: true, message: 'Category deleted successfully' });
}));

// Subscription Plans CRUD
router.get('/subscription-plans', asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ durationMonths: 1, price: 1 });
  res.json({ success: true, data: plans });
}));

router.post('/subscription-plans', asyncHandler(async (req, res) => {
  const { name, description, price, currency, duration, durationMonths, features, isActive, isPopular } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Plan name is required' });
  }

  if (!price || price <= 0) {
    return res.status(400).json({ message: 'Valid price is required' });
  }

  const plan = await SubscriptionPlan.create({
    name: name.trim(),
    description: description?.trim(),
    price: parseFloat(price),
    currency: currency || 'USD',
    duration: duration || 'monthly',
    durationMonths: parseInt(durationMonths) || 1,
    features: features || [],
    isActive: isActive !== false,
    isPopular: isPopular || false
  });

  res.status(201).json({ success: true, data: plan });
}));

router.put('/subscription-plans/:id', asyncHandler(async (req, res) => {
  const { name, description, price, currency, duration, durationMonths, features, isActive, isPopular } = req.body;
  
  const updateData = { 
    description: description?.trim(), 
    currency, 
    duration, 
    durationMonths: parseInt(durationMonths),
    features: features || [],
    isActive, 
    isPopular 
  };

  if (name && name.trim()) {
    updateData.name = name.trim();
  }

  if (price && price > 0) {
    updateData.price = parseFloat(price);
  }

  const plan = await SubscriptionPlan.findByIdAndUpdate(
    req.params.id, updateData, { new: true }
  );

  if (!plan) {
    return res.status(404).json({ message: 'Subscription plan not found' });
  }
  res.json({ success: true, data: plan });
}));

router.delete('/subscription-plans/:id', asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
  if (!plan) {
    return res.status(404).json({ message: 'Subscription plan not found' });
  }
  res.json({ success: true, message: 'Subscription plan deleted successfully' });
}));

// Analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  
  switch (range) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  // Get basic counts
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ 
    isActive: true, 
    isBlocked: false 
  });
  const subscribers = await User.countDocuments({ 
    'subscription.status': 'active',
    'subscription.endDate': { $gt: now }
  });
  const totalContent = await Content.countDocuments({ isPublished: true });

  // Calculate revenue (mock data for now)
  const totalRevenue = subscribers * 15.99; // Average subscription price
  const monthlyRevenue = subscribers * 15.99;

  // Get top content
  const topContent = await Content.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title type rating');

  // Mock growth data
  const userGrowth = [
    { period: 'Total Users', growth: 12.5 },
    { period: 'Active Users', growth: 8.3 },
    { period: 'Subscribers', growth: 15.7 }
  ];

  const revenueGrowth = [
    { period: 'Total Revenue', growth: 22.1 },
    { period: 'Monthly Revenue', growth: 18.5 }
  ];

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      subscribers,
      totalContent,
      totalRevenue,
      monthlyRevenue,
      topContent,
      userGrowth,
      revenueGrowth,
      dateRange: { start: startDate, end: now }
    }
  });
}));

// Settings
router.get('/settings', asyncHandler(async (req, res) => {
  const PlatformSettings = require('../models/PlatformSettings');
  const settings = await PlatformSettings.getSingleton();
  res.json({ success: true, data: settings });
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const PlatformSettings = require('../models/PlatformSettings');
  const settings = await PlatformSettings.getSingleton();
  Object.assign(settings, req.body || {});
  await settings.save();
  res.json({ success: true, data: settings });
}));

module.exports = router;

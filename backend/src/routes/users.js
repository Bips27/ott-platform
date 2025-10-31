const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, preferences },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's watch history
router.get('/watch-history', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('watchHistory.contentId');
    res.json(user.watchHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to watch history
router.post('/watch-history', async (req, res) => {
  try {
    const { contentId, watchedAt, duration } = req.body;
    
    const user = await User.findById(req.user.id);
    const existingEntry = user.watchHistory.find(entry => 
      entry.contentId.toString() === contentId
    );
    
    if (existingEntry) {
      existingEntry.watchedAt = watchedAt;
      existingEntry.duration = duration;
    } else {
      user.watchHistory.push({ contentId, watchedAt, duration });
    }
    
    await user.save();
    res.json({ message: 'Watch history updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

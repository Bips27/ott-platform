const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// Get all published content (optionally paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };

    const [items, total] = await Promise.all([
      Content.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Content.countDocuments(filter)
    ]);

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hero sections for homepage
router.get('/hero-sections', async (req, res) => {
  try {
    const HeroSection = require('../models/HeroSection');
    const heroSections = await HeroSection.find({ isActive: true })
      .populate('content', 'title description thumbnailUrl backgroundThumbnailUrl videoUrl trailerUrl type category rating')
      .sort({ order: 1 });
    
    res.json({ success: true, data: heroSections });
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get homepage sections
router.get('/homepage/sections', async (req, res) => {
  try {
    // New dynamic sections mode from FeaturedSection
    const FeaturedSection = require('../models/FeaturedSection');
    const Category = require('../models/Category');
    const sectionsFromDb = await FeaturedSection.find({ isActive: true })
      .populate('category')
      .sort({ order: 1, createdAt: 1 });

    if (sectionsFromDb.length > 0) {
      const payload = [];
      for (const s of sectionsFromDb) {
        const sectionKey = s.name.toLowerCase().replace(/\s/g, '_');
        const query = { 
          isPublished: true,
          homepageSections: { $in: [sectionKey] }
        };
        if (s.contentType !== 'all') {
          query.type = s.contentType;
        }
        if (s.category) {
          query.category = s.category.name;
        }
        
        console.log(`Querying section "${s.name}" with key "${sectionKey}":`, query);
        const items = await Content.find(query).sort({ createdAt: -1 }).limit(18);
        console.log(`Found ${items.length} items for section "${s.name}"`);
        payload.push({
          name: s.name,
          contentType: s.contentType,
          category: s.category,
          items
        });
      }
      return res.json({ data: payload });
    }

    // Fallback to legacy boolean flags
    const sections = {
      featured: await Content.find({ 
        homepageSections: 'featured', 
        isPublished: true 
      }).sort({ createdAt: -1 }).limit(10),
      trending: await Content.find({ 
        homepageSections: 'trending', 
        isPublished: true 
      }).sort({ views: -1 }).limit(10),
      new_releases: await Content.find({ 
        homepageSections: 'new_releases', 
        isPublished: true 
      }).sort({ releaseDate: -1 }).limit(10),
      top_picks: await Content.find({ 
        homepageSections: 'top_picks', 
        isPublished: true 
      }).sort({ 'rating.average': -1 }).limit(10),
      recommended: await Content.find({ 
        homepageSections: 'recommended', 
        isPublished: true 
      }).sort({ createdAt: -1 }).limit(10)
    };

    res.json({ data: sections });
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific content by id OR by category (movies, shows, trailers)
router.get('/:param', async (req, res) => {
  try {
    const { param } = req.params;
    const knownCategories = ['movies', 'shows', 'trailers'];

    if (knownCategories.includes(param)) {
      // Map category param to type in DB
      const typeMap = {
        movies: 'movie',
        shows: 'series',
        trailers: 'trailer'
      };
      const type = typeMap[param];
      const items = await Content.find({ type, isPublished: true }).sort({ createdAt: -1 });
      return res.json({ data: items });
    }

    // Otherwise treat as ID
    const content = await Content.findById(param);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    return res.json({ data: content });
  } catch (error) {
    console.error('Error fetching content by param:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Search content
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const content = await Content.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } }
      ]
    , isPublished: true });
    
    res.json({ data: content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

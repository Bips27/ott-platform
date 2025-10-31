const mongoose = require('mongoose');
const Category = require('../models/Category');
const FeaturedSection = require('../models/FeaturedSection');
require('dotenv').config();

async function seedDefaults() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ott-platform');
    console.log('Connected to MongoDB');

    // Create default categories
    const defaultCategories = [
      { name: 'Action', contentType: 'movie' },
      { name: 'Comedy', contentType: 'movie' },
      { name: 'Drama', contentType: 'movie' },
      { name: 'Horror', contentType: 'movie' },
      { name: 'Sci-Fi', contentType: 'movie' },
      { name: 'Thriller', contentType: 'movie' },
      { name: 'Romance', contentType: 'movie' },
      { name: 'Documentary', contentType: 'movie' },
      { name: 'TV Series', contentType: 'series' },
      { name: 'Anime', contentType: 'series' },
      { name: 'Trailers', contentType: 'trailer' }
    ];

    console.log('Creating default categories...');
    for (const catData of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: catData.name },
        catData,
        { upsert: true, new: true }
      );
    }

    // Create default featured sections
    const defaultSections = [
      { name: 'Featured', contentType: 'all', order: 0 },
      { name: 'Trending Now', contentType: 'all', order: 1 },
      { name: 'New Releases', contentType: 'all', order: 2 },
      { name: 'Top Picks for You', contentType: 'all', order: 3 },
      { name: 'Recommended', contentType: 'all', order: 4 }
    ];

    console.log('Creating default featured sections...');
    for (const sectionData of defaultSections) {
      await FeaturedSection.findOneAndUpdate(
        { name: sectionData.name },
        sectionData,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Default categories and featured sections created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding defaults:', error);
    process.exit(1);
  }
}

seedDefaults();

const mongoose = require('mongoose');
const Content = require('../models/Content');
const FeaturedSection = require('../models/FeaturedSection');
require('dotenv').config();

async function populateSections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ott-platform');
    console.log('Connected to MongoDB');

    // Get all published content
    const allContent = await Content.find({ isPublished: true }).sort({ createdAt: -1 });
    console.log(`Found ${allContent.length} published content items`);

    if (allContent.length === 0) {
      console.log('No content found. Please add some content first.');
      process.exit(0);
    }

    // Update content to include homepage sections
    const movies = allContent.filter(c => c.type === 'movie').slice(0, 10);
    const series = allContent.filter(c => c.type === 'series').slice(0, 10);
    const trailers = allContent.filter(c => c.type === 'trailer').slice(0, 5);

    // Update movies for featured sections
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      const sections = [];
      
      if (i < 3) sections.push('featured');
      if (i < 5) sections.push('trending');
      if (i < 7) sections.push('new_releases');
      if (i < 4) sections.push('top_picks');
      if (i < 6) sections.push('recommended');

      await Content.findByIdAndUpdate(movie._id, { homepageSections: sections });
    }

    // Update series for featured sections
    for (let i = 0; i < series.length; i++) {
      const show = series[i];
      const sections = [];
      
      if (i < 2) sections.push('featured');
      if (i < 4) sections.push('trending');
      if (i < 6) sections.push('new_releases');
      if (i < 3) sections.push('top_picks');
      if (i < 5) sections.push('recommended');

      await Content.findByIdAndUpdate(show._id, { homepageSections: sections });
    }

    // Update trailers for featured sections
    for (let i = 0; i < trailers.length; i++) {
      const trailer = trailers[i];
      const sections = [];
      
      if (i < 2) sections.push('featured');
      if (i < 3) sections.push('trending');

      await Content.findByIdAndUpdate(trailer._id, { homepageSections: sections });
    }

    console.log('✅ Content updated with homepage sections!');
    console.log(`- Movies: ${movies.length} updated`);
    console.log(`- Series: ${series.length} updated`);
    console.log(`- Trailers: ${trailers.length} updated`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating sections:', error);
    process.exit(1);
  }
}

populateSections();

const express = require('express');
const router = express.Router();
const PlayerSettings = require('../models/PlayerSettings');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Get player settings for the authenticated user
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const settings = await PlayerSettings.getOrCreateSettings(req.user.id);
  
  res.json({
    success: true,
    data: settings
  });
}));

// Update player settings for the authenticated user
router.put('/', authMiddleware, asyncHandler(async (req, res) => {
  const settings = await PlayerSettings.getOrCreateSettings(req.user.id);
  
  // Validate the request body
  const {
    autoplay,
    quality,
    subtitles,
    audio,
    playback,
    skipIntro,
    theme,
    advanced
  } = req.body;
  
  // Update settings
  const updates = {};
  
  if (autoplay !== undefined) updates.autoplay = autoplay;
  if (quality !== undefined) updates.quality = quality;
  if (subtitles !== undefined) updates.subtitles = subtitles;
  if (audio !== undefined) updates.audio = audio;
  if (playback !== undefined) updates.playback = playback;
  if (skipIntro !== undefined) updates.skipIntro = skipIntro;
  if (theme !== undefined) updates.theme = theme;
  if (advanced !== undefined) updates.advanced = advanced;
  
  await settings.updateSettings(updates);
  
  res.json({
    success: true,
    message: 'Player settings updated successfully',
    data: settings
  });
}));

// Reset player settings to defaults
router.post('/reset', authMiddleware, asyncHandler(async (req, res) => {
  const settings = await PlayerSettings.findOneAndUpdate(
    { userId: req.user.id },
    { $unset: { 
      autoplay: 1,
      quality: 1,
      subtitles: 1,
      audio: 1,
      playback: 1,
      skipIntro: 1,
      theme: 1,
      advanced: 1
    }},
    { new: true, upsert: true }
  );
  
  res.json({
    success: true,
    message: 'Player settings reset to defaults',
    data: settings
  });
}));

// Get available languages for subtitles and audio
router.get('/languages', asyncHandler(async (req, res) => {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' }
  ];
  
  res.json({
    success: true,
    data: languages
  });
}));

// Get available quality options
router.get('/quality-options', asyncHandler(async (req, res) => {
  const qualityOptions = [
    { value: 'auto', label: 'Auto (Recommended)', description: 'Automatically adjust quality based on connection' },
    { value: '480p', label: '480p', description: 'Standard Definition' },
    { value: '720p', label: '720p', description: 'High Definition' },
    { value: '1080p', label: '1080p', description: 'Full High Definition' },
    { value: '4K', label: '4K', description: 'Ultra High Definition' }
  ];
  
  res.json({
    success: true,
    data: qualityOptions
  });
}));

// Get available playback speed options
router.get('/speed-options', asyncHandler(async (req, res) => {
  const speedOptions = [
    { value: 0.25, label: '0.25x', description: 'Very Slow' },
    { value: 0.5, label: '0.5x', description: 'Slow' },
    { value: 0.75, label: '0.75x', description: 'Slightly Slow' },
    { value: 1.0, label: '1x', description: 'Normal Speed' },
    { value: 1.25, label: '1.25x', description: 'Slightly Fast' },
    { value: 1.5, label: '1.5x', description: 'Fast' },
    { value: 1.75, label: '1.75x', description: 'Very Fast' },
    { value: 2.0, label: '2x', description: 'Maximum Speed' }
  ];
  
  res.json({
    success: true,
    data: speedOptions
  });
}));

module.exports = router;

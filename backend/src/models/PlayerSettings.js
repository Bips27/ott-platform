const mongoose = require('mongoose');

const playerSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Autoplay settings
  autoplay: {
    enabled: {
      type: Boolean,
      default: true
    },
    nextEpisode: {
      type: Boolean,
      default: true
    },
    trailers: {
      type: Boolean,
      default: false
    }
  },
  
  // Playback quality settings
  quality: {
    default: {
      type: String,
      enum: ['auto', '480p', '720p', '1080p', '4K'],
      default: 'auto'
    },
    maxQuality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4K'],
      default: '4K'
    },
    adaptiveBitrate: {
      type: Boolean,
      default: true
    }
  },
  
  // Subtitles/Closed Captions settings
  subtitles: {
    enabled: {
      type: Boolean,
      default: false
    },
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    fontColor: {
      type: String,
      default: '#FFFFFF'
    },
    backgroundColor: {
      type: String,
      default: '#000000'
    },
    opacity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    }
  },
  
  // Audio settings
  audio: {
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    volume: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    normalizeAudio: {
      type: Boolean,
      default: true
    }
  },
  
  // Playback speed settings
  playback: {
    defaultSpeed: {
      type: Number,
      min: 0.25,
      max: 2.0,
      default: 1.0
    },
    allowSpeedControls: {
      type: Boolean,
      default: true
    },
    speedOptions: [{
      type: Number,
      default: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
    }]
  },
  
  // Skip intro settings
  skipIntro: {
    enabled: {
      type: Boolean,
      default: true
    },
    skipOutro: {
      type: Boolean,
      default: false
    },
    skipRecap: {
      type: Boolean,
      default: true
    }
  },
  
  // Theme settings
  theme: {
    playerControls: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    progressBar: {
      type: String,
      enum: ['red', 'blue', 'green', 'purple'],
      default: 'red'
    },
    buttonStyle: {
      type: String,
      enum: ['minimal', 'standard', 'detailed'],
      default: 'standard'
    }
  },
  
  // Advanced settings
  advanced: {
    hardwareAcceleration: {
      type: Boolean,
      default: true
    },
    lowLatencyMode: {
      type: Boolean,
      default: false
    },
    debugMode: {
      type: Boolean,
      default: false
    }
  },
  // Content protection settings
  protection: {
    antiScreenshot: {
      type: Boolean,
      default: true
    },
    antiScreenRecord: {
      type: Boolean,
      default: true
    },
    watermark: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: 'CONFIDENTIAL' },
      opacity: { type: Number, min: 0, max: 1, default: 0.15 }
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
playerSettingsSchema.index({ userId: 1 });

// Static method to get or create settings for a user
playerSettingsSchema.statics.getOrCreateSettings = async function(userId) {
  let settings = await this.findOne({ userId });
  
  if (!settings) {
    settings = new this({ userId });
    await settings.save();
  }
  
  return settings;
};

// Instance method to update settings
playerSettingsSchema.methods.updateSettings = async function(updates) {
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      this[key] = updates[key];
    }
  });
  
  return await this.save();
};

module.exports = mongoose.model('PlayerSettings', playerSettingsSchema);

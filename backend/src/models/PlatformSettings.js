const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'OTT Platform' },
  platformDescription: { type: String, default: 'Stream your favorite content' },
  logoUrl: { type: String, default: '' },
  primaryColor: { type: String, default: '#E50914' },
  secondaryColor: { type: String, default: '#000000' },
  autoplay: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: true },
  allowSocialLogin: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 7 },
  maxLoginAttempts: { type: Number, default: 5 },
  showPlatformName: { type: Boolean, default: true },
  stripePublicKey: { type: String, default: '' },
  stripeSecretKey: { type: String, default: '' }
}, { timestamps: true });

// Ensure a single document pattern
platformSettingsSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
}

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);



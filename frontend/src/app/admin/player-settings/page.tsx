'use client';

import { useState, useEffect } from 'react';
import { useToastContext } from '@/components/ToastProvider';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  PlayIcon, 
  CogIcon, 
  CheckIcon, 
  XMarkIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface PlayerSettings {
  autoplay: {
    enabled: boolean;
    nextEpisode: boolean;
    trailers: boolean;
  };
  quality: {
    default: string;
    maxQuality: string;
    adaptiveBitrate: boolean;
  };
  subtitles: {
    enabled: boolean;
    defaultLanguage: string;
    fontSize: string;
    fontColor: string;
    backgroundColor: string;
    opacity: number;
  };
  audio: {
    defaultLanguage: string;
    volume: number;
    normalizeAudio: boolean;
  };
  playback: {
    defaultSpeed: number;
    allowSpeedControls: boolean;
    speedOptions: number[];
  };
  skipIntro: {
    enabled: boolean;
    skipOutro: boolean;
    skipRecap: boolean;
  };
  theme: {
    playerControls: string;
    progressBar: string;
    buttonStyle: string;
  };
  advanced: {
    hardwareAcceleration: boolean;
    lowLatencyMode: boolean;
    debugMode: boolean;
  };
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface QualityOption {
  value: string;
  label: string;
  description: string;
}

interface SpeedOption {
  value: number;
  label: string;
  description: string;
}

export default function PlayerSettingsPage() {
  const { success, error } = useToastContext();
  const [settings, setSettings] = useState<PlayerSettings | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([]);
  const [speedOptions, setSpeedOptions] = useState<SpeedOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Default settings
  const defaultSettings: PlayerSettings = {
    autoplay: {
      enabled: true,
      nextEpisode: true,
      trailers: false
    },
    quality: {
      default: 'auto',
      maxQuality: '4K',
      adaptiveBitrate: true
    },
    subtitles: {
      enabled: false,
      defaultLanguage: 'en',
      fontSize: 'medium',
      fontColor: '#FFFFFF',
      backgroundColor: '#000000',
      opacity: 0.8
    },
    audio: {
      defaultLanguage: 'en',
      volume: 80,
      normalizeAudio: true
    },
    playback: {
      defaultSpeed: 1.0,
      allowSpeedControls: true,
      speedOptions: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
    },
    skipIntro: {
      enabled: true,
      skipOutro: false,
      skipRecap: true
    },
    theme: {
      playerControls: 'dark',
      progressBar: 'red',
      buttonStyle: 'standard'
    },
    advanced: {
      hardwareAcceleration: true,
      lowLatencyMode: false,
      debugMode: false
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchOptions();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/player-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data || defaultSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching player settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [languagesRes, qualityRes, speedRes] = await Promise.all([
        fetch('/api/admin/player-settings/languages'),
        fetch('/api/admin/player-settings/quality-options'),
        fetch('/api/admin/player-settings/speed-options')
      ]);

      if (languagesRes.ok) {
        const languagesData = await languagesRes.json();
        setLanguages(languagesData.data);
      } else {
        // Fallback data
        setLanguages([
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'es', name: 'Spanish', nativeName: 'Español' },
          { code: 'fr', name: 'French', nativeName: 'Français' },
          { code: 'de', name: 'German', nativeName: 'Deutsch' },
          { code: 'it', name: 'Italian', nativeName: 'Italiano' },
          { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
          { code: 'ru', name: 'Russian', nativeName: 'Русский' },
          { code: 'ja', name: 'Japanese', nativeName: '日本語' },
          { code: 'ko', name: 'Korean', nativeName: '한국어' },
          { code: 'zh', name: 'Chinese', nativeName: '中文' }
        ]);
      }

      if (qualityRes.ok) {
        const qualityData = await qualityRes.json();
        setQualityOptions(qualityData.data);
      } else {
        // Fallback data
        setQualityOptions([
          { value: 'auto', label: 'Auto', description: 'Automatically adjust quality' },
          { value: '480p', label: '480p', description: 'Standard Definition' },
          { value: '720p', label: '720p', description: 'High Definition' },
          { value: '1080p', label: '1080p', description: 'Full High Definition' },
          { value: '4K', label: '4K', description: 'Ultra High Definition' }
        ]);
      }

      if (speedRes.ok) {
        const speedData = await speedRes.json();
        setSpeedOptions(speedData.data);
      } else {
        // Fallback data
        setSpeedOptions([
          { value: 0.25, label: '0.25x', description: 'Quarter speed' },
          { value: 0.5, label: '0.5x', description: 'Half speed' },
          { value: 0.75, label: '0.75x', description: 'Three-quarter speed' },
          { value: 1.0, label: '1x', description: 'Normal speed' },
          { value: 1.25, label: '1.25x', description: 'One and quarter speed' },
          { value: 1.5, label: '1.5x', description: 'One and half speed' },
          { value: 1.75, label: '1.75x', description: 'One and three-quarter speed' },
          { value: 2.0, label: '2x', description: 'Double speed' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      // Set fallback data on error
      setLanguages([
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
        { code: 'de', name: 'German', nativeName: 'Deutsch' },
        { code: 'it', name: 'Italian', nativeName: 'Italiano' },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語' },
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'zh', name: 'Chinese', nativeName: '中文' }
      ]);
      setQualityOptions([
        { value: 'auto', label: 'Auto', description: 'Automatically adjust quality' },
        { value: '480p', label: '480p', description: 'Standard Definition' },
        { value: '720p', label: '720p', description: 'High Definition' },
        { value: '1080p', label: '1080p', description: 'Full High Definition' },
        { value: '4K', label: '4K', description: 'Ultra High Definition' }
      ]);
      setSpeedOptions([
        { value: 0.25, label: '0.25x', description: 'Quarter speed' },
        { value: 0.5, label: '0.5x', description: 'Half speed' },
        { value: 0.75, label: '0.75x', description: 'Three-quarter speed' },
        { value: 1.0, label: '1x', description: 'Normal speed' },
        { value: 1.25, label: '1.25x', description: 'One and quarter speed' },
        { value: 1.5, label: '1.5x', description: 'One and half speed' },
        { value: 1.75, label: '1.75x', description: 'One and three-quarter speed' },
        { value: 2.0, label: '2x', description: 'Double speed' }
      ]);
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;

    const newSettings = { ...settings };
    const keys = path.split('.');
    let current = newSettings as any;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
    setHasChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[path]) {
      const newErrors = { ...validationErrors };
      delete newErrors[path];
      setValidationErrors(newErrors);
    }
  };

  const validateSettings = (settings: PlayerSettings): {[key: string]: string} => {
    const errors: {[key: string]: string} = {};
    
    // Validate volume range
    if (settings.audio.volume < 0 || settings.audio.volume > 100) {
      errors['audio.volume'] = 'Volume must be between 0 and 100';
    }
    
    // Validate playback speed
    if (settings.playback.defaultSpeed < 0.25 || settings.playback.defaultSpeed > 2.0) {
      errors['playback.defaultSpeed'] = 'Playback speed must be between 0.25x and 2.0x';
    }
    
    // Validate subtitle opacity
    if (settings.subtitles.opacity < 0 || settings.subtitles.opacity > 1) {
      errors['subtitles.opacity'] = 'Opacity must be between 0 and 1';
    }
    
    return errors;
  };

  const saveSettings = async () => {
    if (!settings) return;

    // Validate settings before saving
    const errors = validateSettings(settings);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      error('Validation Error', 'Please fix the validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/player-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        success('Success', 'Player settings saved successfully!');
        setHasChanges(false);
        setValidationErrors({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving player settings:', error);
      error('Error', 'Failed to save player settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/player-settings/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data || defaultSettings);
        setHasChanges(false);
        success('Success', 'Player settings reset to defaults!');
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting player settings:', error);
      error('Error', 'Failed to reset player settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <AdminSidebar />
        <div className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full border-2 border-netflix-gray border-t-netflix-red w-12 h-12 mx-auto mb-4"></div>
              <p className="text-body text-netflix-text-gray">Loading player settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <AdminSidebar />
        <div className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <p className="text-body text-netflix-text-gray">Failed to load player settings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-netflix-red rounded-lg flex items-center justify-center">
              <CogIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-heading-2 text-white font-bold">Player Settings</h1>
              <p className="text-body text-netflix-text-gray">Customize your video player experience</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={resetSettings}
              className="btn btn-secondary btn-sm flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
            
            <button
              onClick={saveSettings}
              disabled={!hasChanges || saving}
              className="btn btn-primary btn-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4"></div>
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Autoplay Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <PlayIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Autoplay</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Enable Autoplay</label>
                  <p className="text-netflix-text-gray text-sm">Automatically start playing videos</p>
                </div>
                <button
                  onClick={() => updateSetting('autoplay.enabled', !settings.autoplay.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoplay.enabled ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoplay.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Next Episode</label>
                  <p className="text-netflix-text-gray text-sm">Auto-play next episode in series</p>
                </div>
                <button
                  onClick={() => updateSetting('autoplay.nextEpisode', !settings.autoplay.nextEpisode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoplay.nextEpisode ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoplay.nextEpisode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Trailers</label>
                  <p className="text-netflix-text-gray text-sm">Auto-play trailers before content</p>
                </div>
                <button
                  onClick={() => updateSetting('autoplay.trailers', !settings.autoplay.trailers)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoplay.trailers ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoplay.trailers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quality Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <EyeIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Playback Quality</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">Default Quality</label>
                <select
                  value={settings.quality.default}
                  onChange={(e) => updateSetting('quality.default', e.target.value)}
                  className="form-select w-full"
                >
                  {qualityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Maximum Quality</label>
                <select
                  value={settings.quality.maxQuality}
                  onChange={(e) => updateSetting('quality.maxQuality', e.target.value)}
                  className="form-select w-full"
                >
                  {qualityOptions.filter(opt => opt.value !== 'auto').map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Adaptive Bitrate</label>
                  <p className="text-netflix-text-gray text-sm">Automatically adjust quality based on connection</p>
                </div>
                <button
                  onClick={() => updateSetting('quality.adaptiveBitrate', !settings.quality.adaptiveBitrate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.quality.adaptiveBitrate ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.quality.adaptiveBitrate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Subtitles Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <LanguageIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Subtitles & Captions</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Enable Subtitles</label>
                  <p className="text-netflix-text-gray text-sm">Show subtitles by default</p>
                </div>
                <button
                  onClick={() => updateSetting('subtitles.enabled', !settings.subtitles.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.subtitles.enabled ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.subtitles.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Default Language</label>
                <select
                  value={settings.subtitles.defaultLanguage}
                  onChange={(e) => updateSetting('subtitles.defaultLanguage', e.target.value)}
                  className="form-select w-full"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Font Size</label>
                <select
                  value={settings.subtitles.fontSize}
                  onChange={(e) => updateSetting('subtitles.fontSize', e.target.value)}
                  className="form-select w-full"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Font Color</label>
                  <input
                    type="color"
                    value={settings.subtitles.fontColor}
                    onChange={(e) => updateSetting('subtitles.fontColor', e.target.value)}
                    className="w-full h-10 rounded border border-gray-600 bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Background Color</label>
                  <input
                    type="color"
                    value={settings.subtitles.backgroundColor}
                    onChange={(e) => updateSetting('subtitles.backgroundColor', e.target.value)}
                    className="w-full h-10 rounded border border-gray-600 bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">
                  Background Opacity: {Math.round(settings.subtitles.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.subtitles.opacity}
                  onChange={(e) => updateSetting('subtitles.opacity', parseFloat(e.target.value))}
                  className="w-full"
                />
                {validationErrors['subtitles.opacity'] && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors['subtitles.opacity']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <SpeakerWaveIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Audio</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">Default Language</label>
                <select
                  value={settings.audio.defaultLanguage}
                  onChange={(e) => updateSetting('audio.defaultLanguage', e.target.value)}
                  className="form-select w-full"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">
                  Default Volume: {settings.audio.volume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.audio.volume}
                  onChange={(e) => updateSetting('audio.volume', parseInt(e.target.value))}
                  className="w-full"
                />
                {validationErrors['audio.volume'] && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors['audio.volume']}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Normalize Audio</label>
                  <p className="text-netflix-text-gray text-sm">Balance audio levels across content</p>
                </div>
                <button
                  onClick={() => updateSetting('audio.normalizeAudio', !settings.audio.normalizeAudio)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.audio.normalizeAudio ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.audio.normalizeAudio ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Playback Speed Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <PlayIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Playback Speed</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">Default Speed</label>
                <select
                  value={settings.playback.defaultSpeed}
                  onChange={(e) => updateSetting('playback.defaultSpeed', parseFloat(e.target.value))}
                  className="form-select w-full"
                >
                  {speedOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Allow Speed Controls</label>
                  <p className="text-netflix-text-gray text-sm">Show speed control buttons in player</p>
                </div>
                <button
                  onClick={() => updateSetting('playback.allowSpeedControls', !settings.playback.allowSpeedControls)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.playback.allowSpeedControls ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.playback.allowSpeedControls ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Skip Intro Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <XMarkIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Skip Options</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Skip Intro</label>
                  <p className="text-netflix-text-gray text-sm">Show skip intro button</p>
                </div>
                <button
                  onClick={() => updateSetting('skipIntro.enabled', !settings.skipIntro.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.skipIntro.enabled ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.skipIntro.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Skip Outro</label>
                  <p className="text-netflix-text-gray text-sm">Show skip outro button</p>
                </div>
                <button
                  onClick={() => updateSetting('skipIntro.skipOutro', !settings.skipIntro.skipOutro)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.skipIntro.skipOutro ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.skipIntro.skipOutro ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Skip Recap</label>
                  <p className="text-netflix-text-gray text-sm">Show skip recap button</p>
                </div>
                <button
                  onClick={() => updateSetting('skipIntro.skipRecap', !settings.skipIntro.skipRecap)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.skipIntro.skipRecap ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.skipIntro.skipRecap ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <EyeIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Theme & Appearance</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">Player Controls Theme</label>
                <select
                  value={settings.theme.playerControls}
                  onChange={(e) => updateSetting('theme.playerControls', e.target.value)}
                  className="form-select w-full"
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Progress Bar Color</label>
                <select
                  value={settings.theme.progressBar}
                  onChange={(e) => updateSetting('theme.progressBar', e.target.value)}
                  className="form-select w-full"
                >
                  <option value="red">Netflix Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                </select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Button Style</label>
                <select
                  value={settings.theme.buttonStyle}
                  onChange={(e) => updateSetting('theme.buttonStyle', e.target.value)}
                  className="form-select w-full"
                >
                  <option value="minimal">Minimal</option>
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <CogIcon className="w-6 h-6 text-netflix-red" />
                <h2 className="text-heading-4 text-white font-semibold">Advanced</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Hardware Acceleration</label>
                  <p className="text-netflix-text-gray text-sm">Use GPU for video decoding</p>
                </div>
                <button
                  onClick={() => updateSetting('advanced.hardwareAcceleration', !settings.advanced.hardwareAcceleration)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.advanced.hardwareAcceleration ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.advanced.hardwareAcceleration ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Low Latency Mode</label>
                  <p className="text-netflix-text-gray text-sm">Reduce delay for live content</p>
                </div>
                <button
                  onClick={() => updateSetting('advanced.lowLatencyMode', !settings.advanced.lowLatencyMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.advanced.lowLatencyMode ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.advanced.lowLatencyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Debug Mode</label>
                  <p className="text-netflix-text-gray text-sm">Show technical information</p>
                </div>
                <button
                  onClick={() => updateSetting('advanced.debugMode', !settings.advanced.debugMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.advanced.debugMode ? 'bg-netflix-red' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.advanced.debugMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

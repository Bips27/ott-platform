'use client';

import { useState, useEffect } from 'react';
import { useToastContext } from '@/components/ToastProvider';
import AdminSidebar from '@/components/AdminSidebar';
import { CogIcon, PaintBrushIcon, PlayIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const isProd = process.env.NODE_ENV === 'production';
  const [settings, setSettings] = useState(() => {
    const defaults = {
      platformName: 'OTT Platform',
      primaryColor: '#E50914',
      logoUrl: '',
      autoplay: true,
      requireEmailVerification: true,
      showPlatformName: true,
      stripePublicKey: '',
      stripeSecretKey: ''
    } as any;
    // Only hydrate from localStorage in development to prevent any production drift
    if (process.env.NODE_ENV !== 'production') {
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('platform_settings');
          if (raw) {
            return { ...defaults, ...JSON.parse(raw) };
          }
        }
      } catch {}
    }
    return defaults;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [didHydrateFromStorage, setDidHydrateFromStorage] = useState(false);
  const { success, error } = useToastContext();

  useEffect(() => {
    // Hydrate from localStorage first to avoid UI resets when navigating
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('platform_settings') : null;
      if (raw) {
        const stored = JSON.parse(raw);
        setSettings((prev) => ({ ...prev, ...stored }));
        setDidHydrateFromStorage(true);
      }
    } catch {}
    fetchSettings();
  }, []);

  // Apply theme variables when primary color changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement as HTMLElement;
      root.style.setProperty('--netflix-red', settings.primaryColor);
    }
  }, [settings.primaryColor]);

  const fetchSettings = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          // Only apply server values if we didn't already hydrate from localStorage
          if (!didHydrateFromStorage) {
            setSettings((prev) => ({ ...prev, ...data.data }));
            if (typeof window !== 'undefined') {
              localStorage.setItem('platform_settings', JSON.stringify({ ...settings, ...data.data }));
              window.dispatchEvent(new Event('platform_settings_updated'));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Persist in localStorage on change so navigating away/back keeps edits (until saved)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('platform_settings', JSON.stringify(settings));
        window.dispatchEvent(new Event('platform_settings_updated'));
      }
    } catch {}
  }, [settings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Persist locally for immediate use across the app
        if (typeof window !== 'undefined') {
          localStorage.setItem('platform_settings', JSON.stringify(settings));
          // Notify other tabs/components
          window.dispatchEvent(new Event('platform_settings_updated'));
        }
        success('Success', 'Settings saved successfully');
      } else {
        error('Error', 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      error('Network Error', 'Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'player', name: 'Player', icon: PlayIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <AdminSidebar />
        <div className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading settings...</div>
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
          <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-gray-400">Configure your platform settings</p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-netflix-dark-gray rounded-lg p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-netflix-red text-white'
                            : 'text-gray-400 hover:text-white hover:bg-netflix-gray'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-netflix-dark-gray rounded-lg p-6">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                        className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                      />
                      <div className="mt-3 flex items-center justify-between bg-netflix-gray rounded-md p-3 border border-gray-700">
                        <div>
                          <label className="text-sm font-medium text-gray-300">Display Platform Name</label>
                          <p className="text-xs text-gray-400">Show the name next to the logo across the site</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.showPlatformName}
                          onChange={(e) => setSettings({...settings, showPlatformName: e.target.checked})}
                          className="w-4 h-4 text-netflix-red bg-netflix-gray border-gray-600 rounded focus:ring-netflix-red"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Appearance Settings</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        className="w-20 h-10 rounded border border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={settings.logoUrl}
                        onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                        className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                        placeholder="https://your-cdn.com/logo.png"
                      />
                      {settings.logoUrl && (
                        <div className="mt-3">
                          <img src={settings.logoUrl} alt="Logo preview" className="h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'player' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Player Settings</h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-300">Autoplay</label>
                        <p className="text-xs text-gray-500">Automatically play next episode</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoplay}
                        onChange={(e) => setSettings({...settings, autoplay: e.target.checked})}
                        className="w-4 h-4 text-netflix-red bg-netflix-gray border-gray-600 rounded focus:ring-netflix-red"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-300">Require Email Verification</label>
                        <p className="text-xs text-gray-500">Users must verify email before accessing content</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})}
                        className="w-4 h-4 text-netflix-red bg-netflix-gray border-gray-600 rounded focus:ring-netflix-red"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Integration Settings</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stripe Publishable Key
                      </label>
                      <input
                        type="text"
                        value={settings.stripePublicKey}
                        onChange={(e) => setSettings({...settings, stripePublicKey: e.target.value})}
                        className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                        placeholder="pk_test_..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stripe Secret Key
                      </label>
                      <input
                        type="password"
                        value={settings.stripeSecretKey}
                        onChange={(e) => setSettings({...settings, stripeSecretKey: e.target.value})}
                        className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                        placeholder="sk_test_..."
                      />
                    </div>
                    <p className="text-xs text-gray-400">These keys are stored server-side; ensure you set environment variables in production.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
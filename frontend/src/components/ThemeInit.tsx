'use client';

import { useEffect } from 'react';

function applyThemeFromSettings() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('platform_settings') : null;
    if (!raw) return;
    const settings = JSON.parse(raw);
    const root = document.documentElement as HTMLElement;
    if (settings?.primaryColor) {
      root.style.setProperty('--netflix-red', settings.primaryColor);
    }
  } catch {
    // ignore
  }
}

export default function ThemeInit() {
  useEffect(() => {
    applyThemeFromSettings();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'platform_settings') {
        applyThemeFromSettings();
      }
    };

    const onCustom = () => applyThemeFromSettings();

    window.addEventListener('storage', onStorage);
    window.addEventListener('platform_settings_updated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('platform_settings_updated', onCustom as EventListener);
    };
  }, []);

  return null;
}



import { useState, useEffect } from 'react';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  language: 'vietsub' | 'thuyetminh' | 'goc';
  defaultQuality: 'auto' | '1080p' | '720p';
  autoplay: boolean;
  userName: string;
  avatarUrl: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'vietsub',
  defaultQuality: 'auto',
  autoplay: true,
  userName: 'Bao Le Huy',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('filmflow_preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }, []);

  const savePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem('filmflow_preferences', JSON.stringify(newPrefs));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = preferences.theme;
      if (currentTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else { // auto
        const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        if (isSystemLight) {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      }
    };
    applyTheme();
  }, [preferences.theme]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...updates };
    savePreferences(updated);
  };

  return {
    preferences,
    updatePreferences
  };
}

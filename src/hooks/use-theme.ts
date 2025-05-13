
'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'enyi-theme';

export function useTheme() {
  // Initialize with 'light' as a default, which will be overridden by useEffect.
  // This helps avoid issues if window/localStorage is not immediately available.
  const [theme, setThemeState] = useState<Theme>('light');

  // Effect to set initial theme from localStorage or system preference
  useEffect(() => {
    let initialTheme: Theme = 'light';
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      // Check if window.matchMedia is available before using it
      const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (storedTheme) {
        initialTheme = storedTheme;
      } else if (prefersDark) {
        initialTheme = 'dark';
      }
    } catch (error) {
      // localStorage might not be available (e.g., in SSR contexts before hydration or private mode)
      console.warn("Could not access localStorage for theme preference.", error);
      // Fallback to system preference if possible, else 'light'
      try {
        if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          initialTheme = 'dark';
        }
      } catch (e) {
        console.warn("Could not access window.matchMedia for theme preference.", e);
      }
    }
    setThemeState(initialTheme);
  }, []);

  // Effect to apply theme to HTML element and update localStorage
  useEffect(() => {
    // Ensure this only runs on the client where document is available
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.warn("Could not save theme preference to localStorage.", error);
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return { theme, toggleTheme, setTheme };
}


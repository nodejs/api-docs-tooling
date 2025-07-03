import { useState, useEffect, useCallback } from 'react';

/**
 * Applies the given theme to the <html> element and persists it in localStorage.
 *
 * @param {string} theme - The theme to apply ('light' or 'dark').
 */
const applyTheme = theme => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

/**
 * A React hook for managing light/dark theme.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const initial =
      localStorage.getItem('theme') ||
      document.documentElement.getAttribute('data-theme') ||
      'light';
    applyTheme(initial);
    setTheme(initial);
  }, []);

  /**
   * Toggle between 'light' and 'dark' themes.
   */
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return next;
    });
  }, []);

  return [theme, toggleTheme];
};

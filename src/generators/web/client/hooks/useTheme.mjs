import { useState, useEffect } from 'react';

/**
 * This hook provides theme management functionality
 */
export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Get initial theme from HTML or fallback to system preference
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');

    const initialTheme =
      currentTheme ||
      localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');

    setTheme(initialTheme);
    htmlElement.setAttribute('data-theme', initialTheme);
  }, []);

  /**
   * Toggles the theme between 'light' and 'dark'.
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return [theme, toggleTheme];
};

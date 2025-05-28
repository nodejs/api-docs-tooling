import { useState } from 'react';

/**
 * This hook provides theme management functionality
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() =>
    CLIENT ? document.documentElement.getAttribute('data-theme') : 'light'
  );

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

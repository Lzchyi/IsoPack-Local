import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isopack_dark_mode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return false;
  });

  useEffect(() => {
    console.log('Dark mode changed:', isDarkMode);
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('isopack_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode] as const;
}

import { useEffect, useState } from 'react';
import '@theme-toggles/react/css/Around.css';
import { Around } from '@theme-toggles/react';

const DEFAULT_THEME = 'cupcake';
const DARK_THEME = 'night';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isMounted, setIsMounted] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Initialize theme from storage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (systemDark ? DARK_THEME : DEFAULT_THEME);
    setTheme(initialTheme);
    setIsMounted(true);

    // Set initial color scheme meta
    document.documentElement.style.colorScheme = initialTheme === DARK_THEME ? 'dark' : 'light';
  }, []);

  // Handle system theme changes when not manually overridden
  useEffect(() => {
    if (isManualOverride) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const newTheme = e.matches ? DARK_THEME : DEFAULT_THEME;
      setTheme(newTheme);
      document.documentElement.style.colorScheme = newTheme === DARK_THEME ? 'dark' : 'light';
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [isManualOverride]);

  // Apply theme changes to DOM and storage
  useEffect(() => {
    if (!isMounted) return;

    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to persist theme preference:', error);
    }
  }, [theme, isMounted]);

  const handleToggle = () => {
    setIsManualOverride(true);
    setTheme((current) => {
      const newTheme = current === DEFAULT_THEME ? DARK_THEME : DEFAULT_THEME;
      document.documentElement.style.colorScheme = newTheme === DARK_THEME ? 'dark' : 'light';
      return newTheme;
    });
  };

  if (!isMounted) {
    // Return placeholder to prevent layout shift
    return <div className="btn btn-ghost text-xl opacity-0">Theme</div>;
  }

  return (
    <Around
      className="btn btn-ghost text-xl"
      toggled={theme === DEFAULT_THEME}
      onToggle={handleToggle}
      duration={300}
    />
  );
};

export default ThemeToggle;

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    
    // Determine resolved theme
    if (savedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(prefersDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(savedTheme);
    }
    
    setIsLoading(false);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', resolvedTheme);
    document.body.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setResolvedTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setSystemTheme = () => {
    setTheme('system');
    localStorage.setItem('theme', 'system');
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setResolvedTheme(prefersDark ? 'dark' : 'light');
  };

  const value = {
    theme,
    resolvedTheme,
    toggleTheme,
    setSystemTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

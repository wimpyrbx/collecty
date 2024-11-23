import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'darkly');

  const themes = [
    'darkly',
    'cyborg',
    'slate',
    'solar',
    'superhero',
    'vapor',
    'morph',
    'quartz'
  ];

  useEffect(() => {
    loadTheme(theme);
  }, [theme]);

  const loadTheme = (themeName) => {
    const link = document.getElementById('bootstrap-theme');
    if (link) {
      link.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${themeName}/bootstrap.min.css`;
    } else {
      const newLink = document.createElement('link');
      newLink.id = 'bootstrap-theme';
      newLink.rel = 'stylesheet';
      newLink.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${themeName}/bootstrap.min.css`;
      document.head.appendChild(newLink);
    }
    localStorage.setItem('theme', themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const themes = [
    { name: 'cerulean', type: 'light', desc: 'A calm blue sky' },
    { name: 'cosmo', type: 'light', desc: 'An ode to Metro' },
    { name: 'cyborg', type: 'dark', desc: 'Jet black and electric blue' },
    { name: 'darkly', type: 'dark', desc: 'Flatly in night mode' },
    { name: 'flatly', type: 'light', desc: 'Flat and modern' },
    { name: 'journal', type: 'light', desc: 'Crisp like a new sheet of paper' },
    { name: 'litera', type: 'light', desc: 'The medium is the message' },
    { name: 'lumen', type: 'light', desc: 'Light and shadow' },
    { name: 'lux', type: 'light', desc: 'A touch of class' },
    { name: 'materia', type: 'light', desc: 'Material is the metaphor' },
    { name: 'minty', type: 'light', desc: 'A fresh feel' },
    { name: 'pulse', type: 'light', desc: 'A trace of purple' },
    { name: 'sandstone', type: 'light', desc: 'A touch of warmth' },
    { name: 'simplex', type: 'light', desc: 'Mini and minimalist' },
    { name: 'sketchy', type: 'light', desc: 'A hand-drawn look' },
    { name: 'slate', type: 'dark', desc: 'Shades of gunmetal gray' },
    { name: 'solar', type: 'light', desc: 'A spin on Solarized' },
    { name: 'spacelab', type: 'light', desc: 'Silvery and sleek' },
    { name: 'superhero', type: 'dark', desc: 'The brave and the blue' },
    { name: 'united', type: 'light', desc: 'Ubuntu orange and unique font' },
    { name: 'yeti', type: 'light', desc: 'A friendly foundation' },
    { name: 'zephyr', type: 'light', desc: 'Breezy and beautiful' },
    { name: 'default', type: 'light', desc: 'Default Bootstrap 5 theme' },
  ];

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default');

  useEffect(() => {
    loadTheme(theme);
  }, [theme]);

  const loadTheme = (themeName) => {
    const themeConfig = themes.find(t => t.name === themeName);
    if (!themeConfig) return;

    const link = document.getElementById('theme-style');
    const href = themeName === 'default' 
      ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' 
      : `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${themeName}/bootstrap.min.css`;

    //console.log('Loading theme:', themeName);
    //console.log('Theme URL:', href);

    if (link) {
      link.href = href;
    } else {
      const newLink = document.createElement('link');
      newLink.id = 'theme-style';
      newLink.rel = 'stylesheet';
      newLink.href = href;
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
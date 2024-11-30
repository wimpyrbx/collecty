import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="theme-switcher p-2">
      <select 
        className="form-select" 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
      >
        {themes.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher; 
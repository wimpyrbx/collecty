import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaPalette } from 'react-icons/fa';

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="dropdown">
      <button 
        className="btn btn-outline-secondary" 
        type="button" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <FaPalette className="me-2" />
        Theme
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {themes.map((themeName) => (
          <li key={themeName}>
            <button
              className={`dropdown-item ${theme === themeName ? 'active' : ''}`}
              onClick={() => setTheme(themeName)}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSwitcher; 
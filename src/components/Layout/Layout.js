import React from 'react';
import Sidebar from './Sidebar';
import ThemeSwitcher from '../ThemeSwitcher';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="position-fixed top-0 end-0 p-3">
          <ThemeSwitcher />
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout; 
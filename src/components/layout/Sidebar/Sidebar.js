import React from 'react';
import { 
  FaBox, 
  FaTags, 
  FaWarehouse, 
  FaGlobe, 
  FaChartLine, 
  FaTools,
  FaBook,
  FaDatabase,
  FaCog,
  FaList,
  FaSignOutAlt
} from 'react-icons/fa';
import SidebarItem from './SidebarItem';
import './Sidebar.css';
import ThemeSwitcher from '../../common/Utils/ThemeSwitcher';

const Sidebar = ({ onLogout }) => {
  const openSwagger = () => {
    window.open('http://localhost:5000/api-docs', '_blank');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
    }
  };

  return (
    <div className="sidebar">
      {/* Theme Switcher at top */}
      <div className="px-3 py-2">
        <ThemeSwitcher />
      </div>

      <ul className="sidebar-menu">
        {/* Dashboard Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaBox /> Dashboard
          </div>
          <ul>
            <SidebarItem to="/products" icon={<FaDatabase />} label="Products" />
            <SidebarItem to="/inventory" icon={<FaList />} label="Inventory" />
          </ul>
        </li>

        {/* Admin Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaCog /> Admin
          </div>
          <ul>
            <SidebarItem to="/attributes" icon={<FaTags />} label="Attributes" />
            <SidebarItem 
              to="/products/groups-types" 
              icon={<FaTags />} 
              label="Groups/Types" 
            />
            <SidebarItem 
              to="/reference/region-ratings" 
              icon={<FaGlobe />} 
              label="Regions/Ratings" 
            />
            <SidebarItem to="/sites" icon={<FaGlobe />} label="Sites" />
          </ul>
        </li>

        {/* Statistics Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaChartLine /> Statistics
          </div>
          <ul>
            <SidebarItem to="/statistics/completion" icon={<FaChartLine />} label="Completion" />
            <SidebarItem to="/statistics/value" icon={<FaChartLine />} label="Value" />
          </ul>
        </li>

        {/* Development Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaTools /> Development
          </div>
          <ul>
            <SidebarItem to="/ui-test" icon={<FaTools />} label="UI Test" />
            <li>
              <a href="#" onClick={openSwagger}>
                <FaBook /> API Docs
              </a>
            </li>
          </ul>
        </li>

        {/* Logout at bottom */}
        <li className="menu-group mt-auto">
          <ul>
            <li>
              <a href="#" onClick={handleLogout} className="logout-link">
                <FaSignOutAlt /> Logout
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 
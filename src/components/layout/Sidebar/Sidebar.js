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
  FaList
} from 'react-icons/fa';
import SidebarItem from './SidebarItem';
import './Sidebar.css';
import ThemeSwitcher from '../../common/Utils/ThemeSwitcher';

const Sidebar = () => {
  const openSwagger = () => {
    window.open('http://localhost:5000/api-docs', '_blank');
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
            <FaBox style={{color: '#4CAF50'}} /> Dashboard
          </div>
          <ul>
            <SidebarItem to="/products" icon={<FaDatabase style={{color: '#66BB6A'}} />} label="Products" />
            <SidebarItem to="/inventory" icon={<FaList style={{color: '#81C784'}} />} label="Inventory" />
          </ul>
        </li>

        {/* Admin Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaCog style={{color: '#2196F3'}} /> Admin
          </div>
          <ul>
            <SidebarItem to="/attributes" icon={<FaTags style={{color: '#42A5F5'}} />} label="Attributes" />
            <SidebarItem 
              to="/products/groups-types" 
              icon={<FaTags style={{color: '#64B5F6'}} />} 
              label="Groups/Types" 
            />
            <SidebarItem 
              to="/reference/region-ratings" 
              icon={<FaGlobe style={{color: '#90CAF9'}} />} 
              label="Regions/Ratings" 
            />
            <SidebarItem to="/sites" icon={<FaGlobe style={{color: '#BBDEFB'}} />} label="Sites" />
          </ul>
        </li>

        {/* Statistics Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaChartLine style={{color: '#FF9800'}} /> Statistics
          </div>
          <ul>
            <SidebarItem to="/statistics/completion" icon={<FaChartLine style={{color: '#FFA726'}} />} label="Completion" />
            <SidebarItem to="/statistics/value" icon={<FaChartLine style={{color: '#FFB74D'}} />} label="Value" />
          </ul>
        </li>

        {/* Development Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaTools style={{color: '#9C27B0'}} /> Development
          </div>
          <ul>
            <SidebarItem to="/ui-test" icon={<FaTools style={{color: '#AB47BC'}} />} label="UI Test" />
            <li>
              <a href="#" onClick={openSwagger}>
                <FaBook style={{color: '#BA68C8'}} /> API Docs
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 
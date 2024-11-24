import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaTags, 
  FaWarehouse, 
  FaGlobe, 
  FaStar, 
  FaChartLine, 
  FaTools,
  FaBook,
  FaDatabase,
  FaCog
} from 'react-icons/fa';
import SidebarItem from './SidebarItem';
import './Sidebar.css';

const Sidebar = () => {
  const openSwagger = () => {
    window.open('http://localhost:5000/api-docs', '_blank');
  };

  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <SidebarItem to="/" icon={<FaHome />} label="Dashboard" />
        
        {/* Products Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaBox /> Products
          </div>
          <ul>
            <SidebarItem to="/products" icon={<FaDatabase />} label="List" />
            <SidebarItem to="/products/groups" icon={<FaTags />} label="Groups" />
            <SidebarItem to="/products/types" icon={<FaTags />} label="Types" />
            <SidebarItem to="/products/attributes" icon={<FaTags />} label="Attributes" />
          </ul>
        </li>

        {/* Inventory Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaWarehouse /> Inventory
          </div>
          <ul>
            <SidebarItem to="/inventory" icon={<FaDatabase />} label="List" />
            <SidebarItem to="/inventory/attributes" icon={<FaTags />} label="Attributes" />
          </ul>
        </li>

        {/* Reference Data Group */}
        <li className="menu-group">
          <div className="menu-group-title">
            <FaCog /> Reference
          </div>
          <ul>
            <SidebarItem to="/regions" icon={<FaGlobe />} label="Regions" />
            <SidebarItem to="/ratings" icon={<FaStar />} label="Ratings" />
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
      </ul>
    </div>
  );
};

export default Sidebar; 
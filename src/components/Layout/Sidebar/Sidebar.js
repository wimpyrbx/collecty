import React from 'react';
import { FaHome, FaBox, FaTags, FaWarehouse, FaGlobe, FaStar, FaChartLine, FaTools } from 'react-icons/fa';
import SidebarItem from './SidebarItem';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <SidebarItem to="/" icon={<FaHome />} label="Dashboard" />
        <SidebarItem to="/products" icon={<FaBox />} label="Products" />
        <SidebarItem to="/products/groups" icon={<FaTags />} label="Product Groups" />
        <SidebarItem to="/inventory" icon={<FaWarehouse />} label="Inventory" />
        <SidebarItem to="/regions" icon={<FaGlobe />} label="Regions" />
        <SidebarItem to="/ratings" icon={<FaStar />} label="Ratings" />
        <SidebarItem to="/statistics/completion" icon={<FaChartLine />} label="Statistics" />
        <SidebarItem to="/ui-test" icon={<FaTools />} label="UI Test" />
      </ul>
    </div>
  );
};

export default Sidebar; 
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaBoxes, 
  FaTags, 
  FaList,
  FaWarehouse, 
  FaCog,
  FaGlobe,
  FaStar,
  FaLink,
  FaChartPie,
  FaChartLine,
  FaPalette
} from 'react-icons/fa';
import ThemeSwitcher from '../ThemeSwitcher';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul className="nav flex-column">
        <li className="nav-item px-3 py-2">
          <ThemeSwitcher />
        </li>
        
        <li className="nav-item">
          <NavLink to="/" end className="nav-link" title="Dashboard">
            <FaHome size={20} />
            <span className="nav-text">Dashboard</span>
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/ui-test" className="nav-link" title="UI Test">
            <FaPalette size={20} />
            <span className="nav-text">UI Test</span>
          </NavLink>
        </li>
        
        <li className="nav-section">
          <small className="text-muted my-2 d-block section-title">Products</small>
          <NavLink to="/products" className="nav-link" title="Product List">
            <FaBox size={20} />
            <span className="nav-text">Product List</span>
          </NavLink>
          <NavLink to="/products/groups" className="nav-link" title="Product Groups">
            <FaBoxes size={20} />
            <span className="nav-text">Groups</span>
          </NavLink>
          <NavLink to="/products/types" className="nav-link" title="Product Types">
            <FaTags size={20} />
            <span className="nav-text">Types</span>
          </NavLink>
          <NavLink to="/products/attributes" className="nav-link" title="Product Attributes">
            <FaList size={20} />
            <span className="nav-text">Attributes</span>
          </NavLink>
        </li>

        <li className="nav-section">
          <small className="text-muted my-2 d-block section-title">Inventory</small>
          <NavLink to="/inventory" className="nav-link" title="Inventory List">
            <FaWarehouse size={20} />
            <span className="nav-text">Inventory List</span>
          </NavLink>
          <NavLink to="/inventory/attributes" className="nav-link" title="Inventory Attributes">
            <FaCog size={20} />
            <span className="nav-text">Attributes</span>
          </NavLink>
        </li>

        <li className="nav-section">
          <small className="text-muted my-2 d-block section-title">Reference</small>
          <NavLink to="/regions" className="nav-link" title="Regions">
            <FaGlobe size={20} />
            <span className="nav-text">Regions</span>
          </NavLink>
          <NavLink to="/ratings" className="nav-link" title="Ratings">
            <FaStar size={20} />
            <span className="nav-text">Ratings</span>
          </NavLink>
          <NavLink to="/sites" className="nav-link" title="Product Sites">
            <FaLink size={20} />
            <span className="nav-text">Sites</span>
          </NavLink>
        </li>

        <li className="nav-section">
          <small className="text-muted my-2 d-block section-title">Stats</small>
          <NavLink to="/statistics/completion" className="nav-link" title="Collection Completion">
            <FaChartPie size={20} />
            <span className="nav-text">Completion</span>
          </NavLink>
          <NavLink to="/statistics/value" className="nav-link" title="Collection Value">
            <FaChartLine size={20} />
            <span className="nav-text">Value</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar; 
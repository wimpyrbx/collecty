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
  FaChartLine
} from 'react-icons/fa';

const Sidebar = () => {
  return (
    <nav className="sidebar bg-dark">
      <div className="sidebar-header">
        <h3 className="text-center">C</h3>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink to="/" end className="nav-link px-2" title="Dashboard">
            <FaHome size={24} />
          </NavLink>
        </li>
        
        <li className="nav-section">
          <small className="text-muted px-2 my-2 d-block text-center">Products</small>
          <NavLink to="/products" className="nav-link px-2" title="Product List">
            <FaBox size={24} />
          </NavLink>
          <NavLink to="/products/groups" className="nav-link px-2" title="Product Groups">
            <FaBoxes size={24} />
          </NavLink>
          <NavLink to="/products/types" className="nav-link px-2" title="Product Types">
            <FaTags size={24} />
          </NavLink>
          <NavLink to="/products/attributes" className="nav-link px-2" title="Product Attributes">
            <FaList size={24} />
          </NavLink>
        </li>

        <li className="nav-section">
          <small className="text-muted px-2 my-2 d-block text-center">Inventory</small>
          <NavLink to="/inventory" className="nav-link px-2" title="Inventory List">
            <FaWarehouse size={24} />
          </NavLink>
          <NavLink to="/inventory/attributes" className="nav-link px-2" title="Inventory Attributes">
            <FaCog size={24} />
          </NavLink>
        </li>

        <li className="nav-section">
          <small className="text-muted px-2 my-2 d-block text-center">Reference</small>
          <NavLink to="/regions" className="nav-link px-2" title="Regions">
            <FaGlobe size={24} />
          </NavLink>
          <NavLink to="/ratings" className="nav-link px-2" title="Ratings">
            <FaStar size={24} />
          </NavLink>
          <NavLink to="/sites" className="nav-link px-2" title="Product Sites">
            <FaLink size={24} />
          </NavLink>
        </li>

        <li className="nav-section">
          <small className="text-muted px-2 my-2 d-block text-center">Stats</small>
          <NavLink to="/statistics/completion" className="nav-link px-2" title="Collection Completion">
            <FaChartPie size={24} />
          </NavLink>
          <NavLink to="/statistics/value" className="nav-link px-2" title="Collection Value">
            <FaChartLine size={24} />
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar; 
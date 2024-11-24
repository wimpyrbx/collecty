import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ to, icon, label }) => {
  return (
    <li>
      <Link to={to}>
        {icon} {label}
      </Link>
    </li>
  );
};

export default SidebarItem; 
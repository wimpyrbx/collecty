import React from 'react';
import { Link } from 'react-router-dom';

function SidebarMenuItem({ label, link }) {
  const path = link || `/${label.toLowerCase()}`;
  return (
    <li>
      <Link to={path}>{label}</Link>
    </li>
  );
}

export default SidebarMenuItem; 
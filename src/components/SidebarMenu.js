import React from 'react';
import SidebarMenuItem from './SidebarMenuItem';

function SidebarMenu() {
  return (
    <ul>
      <SidebarMenuItem label="Overview" />
      <SidebarMenuItem label="Admin" />
    </ul>
  );
}

export default SidebarMenu; 
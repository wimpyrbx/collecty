import React from 'react';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import { FaHome } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div className="page-container">
      <PageHeader>
        <PageHeader.Icon>
          <FaHome />
        </PageHeader.Icon>
        <PageHeader.Title>
          Dashboard
        </PageHeader.Title>
        <PageHeader.Actions>
          {/* Add any dashboard actions here */}
        </PageHeader.Actions>
      </PageHeader>

      <h1>Hello World</h1>
      <p>This is the start/landing page.</p>
    </div>
  );
};

export default Dashboard; 
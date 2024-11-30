import React from 'react';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import { Button } from 'react-bootstrap';
import { FaList, FaPlus } from 'react-icons/fa';

const InventoryList = () => {
  return (
    <div className="page-container">
      <PageHeader>
        <PageHeader.Icon color="#81C784">
          <FaList />
        </PageHeader.Icon>
        <PageHeader.Title>
          Inventory
        </PageHeader.Title>
        <PageHeader.Actions>
          <Button variant="light" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Item
          </Button>
        </PageHeader.Actions>
        <PageHeader.TitleSmall>
          Manage your inventory items and their attributes
        </PageHeader.TitleSmall>
      </PageHeader>
    </div>
  );
};

export default InventoryList; 
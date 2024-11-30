import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaBox, FaPlus } from 'react-icons/fa';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import AddToInventoryFlow from '../../components/inventory/Forms/AddToInventoryFlow';
import './InventoryList.css';

const InventoryList = () => {
  const [showAddFlow, setShowAddFlow] = useState(false);

  return (
    <div className="container-fluid">
      <PageHeader bgClass="bg-primary" textClass="text-white">
        <PageHeader.Icon color="#66BB6A">
          <FaBox />
        </PageHeader.Icon>
        <PageHeader.Title>
          Inventory
        </PageHeader.Title>
        <PageHeader.Actions>
          <Button variant="light" onClick={() => setShowAddFlow(true)}>
            <FaPlus className="me-2" />
            Add Item
          </Button>
        </PageHeader.Actions>
        <PageHeader.TitleSmall>
          Manage your inventory items and stock levels
        </PageHeader.TitleSmall>
      </PageHeader>

      <Container fluid>
        {/* Inventory list content will go here */}
      </Container>

      <AddToInventoryFlow
        show={showAddFlow}
        onHide={() => setShowAddFlow(false)}
        onSuccess={() => {
          setShowAddFlow(false);
          // We'll add a fetch function later
        }}
      />
    </div>
  );
};

export default InventoryList; 
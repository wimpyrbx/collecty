import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaBox, FaPlus } from 'react-icons/fa';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import AddInventoryModal from '../../components/inventory/Forms/AddInventoryModal';

const InventoryList = () => {
  const [showAddModal, setShowAddModal] = useState(false);

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
          <Button variant="light" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Item
          </Button>
        </PageHeader.Actions>
        <PageHeader.TitleSmall>
          Manage your inventory items and stock levels
        </PageHeader.TitleSmall>
      </PageHeader>

      <Container fluid>
        {/* Content will go here */}
      </Container>

      {/* Add Inventory Modal */}
      <AddInventoryModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          // We'll add a fetch function later
        }}
      />
    </div>
  );
};

export default InventoryList; 
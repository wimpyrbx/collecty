import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import { FaGlobe, FaPlus } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

const ProductSites = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="page-container">
      <PageHeader>
        <PageHeader.Icon color="#BBDEFB">
          <FaGlobe />
        </PageHeader.Icon>
        <PageHeader.Title>
          Sites
        </PageHeader.Title>
        <PageHeader.Actions>
          <Button variant="light" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Site
          </Button>
        </PageHeader.Actions>
        <PageHeader.TitleSmall>
          Manage external reference sites for products
        </PageHeader.TitleSmall>
      </PageHeader>
    </div>
  );
};

export default ProductSites; 
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaList, FaPlus, FaSearch, FaFilter, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import NewInventoryModal from './NewInventoryModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import './InventoryList.css';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    product_group_id: '',
    product_type_id: '',
    region_id: '',
    isNew: '',
    hasBox: '',
    hasManual: ''
  });

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory', {
        params: {
          extended: true, // Get product details and attributes
          search: searchTerm,
          ...filters
        }
      });
      setInventory(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [searchTerm, filters]);

  // Handle inventory item deletion
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await axios.delete(`http://localhost:5000/api/inventory/${selectedItem.id}`);
      toast.success('Inventory item deleted successfully');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast.error('Failed to delete inventory item');
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  // Table columns configuration
  const columns = useMemo(() => [
    {
      header: 'Product',
      accessorKey: 'product.title',
      cell: ({ row }) => (
        <div className="product-cell">
          {row.original.product?.productImageThumbnail && (
            <img 
              src={row.original.product.productImageThumbnail} 
              alt={row.original.product.title}
              className="product-thumbnail"
            />
          )}
          <div className="product-info">
            <div className="product-title">{row.original.product?.title}</div>
            <div className="product-details">
              <span>{row.original.product?.productGroup?.name}</span>
              <span>{row.original.product?.region?.name}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Barcode',
      accessorKey: 'barcode',
    },
    {
      header: 'Condition',
      cell: ({ row }) => {
        const conditions = [];
        if (row.original.attributes?.isNew === '1') conditions.push('New');
        if (row.original.attributes?.hasBox === '1') conditions.push('CIB');
        if (row.original.attributes?.hasManual === '1') conditions.push('Manual');
        return conditions.join(', ') || 'Loose';
      }
    },
    {
      header: 'Price',
      cell: ({ row }) => {
        const price = row.original.price_override || 
                     row.original.product?.pricecharting?.loose_nok_fixed;
        return price ? `${price.toFixed(2)} NOK` : '-';
      }
    },
    {
      header: 'Comment',
      accessorKey: 'comment',
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="action-buttons">
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => {
              setSelectedItem(row.original);
              setShowDeleteModal(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="container-fluid p-4">
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

      <div className="content-section">
        <div className="filters-section">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Button 
            variant="outline-secondary"
            className="filter-button"
            onClick={() => {/* Toggle filter panel */}}
          >
            <FaFilter className="me-2" />
            Filters
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={inventory}
          loading={loading}
          pagination
        />
      </div>

      {showAddModal && (
        <NewInventoryModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onInventoryUpdated={fetchInventory}
        />
      )}

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
      />
    </div>
  );
};

export default InventoryList; 
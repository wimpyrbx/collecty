import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../../common/Modal';
import './AddInventoryModal.css';

const AddInventoryModal = ({ show, onHide, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Reset form when modal is closed
  const handleClose = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setSearchResults([]);
    onHide();
  };

  // Handle product search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get('/api/products', {
        params: {
          extended: true,
          search: query
        }
      });
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error searching products:', error);
      // We'll add proper error handling later
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      // We'll implement this later
      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal show={show} onHide={handleClose} size="lg">
      <Form onSubmit={handleSubmit}>
        <BaseModalHeader icon={<FaPlus />} onHide={handleClose}>
          Add Inventory Item
        </BaseModalHeader>
        
        <BaseModalBody>
          <Form.Group className="mb-3">
            <Form.Label>Search Product</Form.Label>
            <Form.Control
              type="text"
              placeholder="Start typing to search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-results mt-2 border rounded">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="p-2 border-bottom cursor-pointer hover-bg-light"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{product.title}</div>
                        <div className="text-muted small">
                          {product.product_group_name} • {product.product_type_name} • {product.region_name}
                        </div>
                      </div>
                      {product.rating_name && (
                        <span className="badge bg-secondary">{product.rating_name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          {selectedProduct && (
            <div className="selected-product-info border rounded p-3 mb-3">
              <h6>Selected Product</h6>
              <p className="mb-2">
                <strong>Title:</strong> {selectedProduct.title}
              </p>
              <p className="mb-2">
                <strong>Group:</strong> {selectedProduct.product_group_name}
              </p>
              <p className="mb-0">
                <strong>Type:</strong> {selectedProduct.product_type_name}
              </p>
            </div>
          )}

          {/* We'll add attribute fields here later */}
        </BaseModalBody>

        <BaseModalFooter
          onCancel={handleClose}
          onConfirm={handleSubmit}
          confirmText={isSubmitting ? 'Adding...' : 'Add Item'}
          isLoading={isSubmitting}
          confirmVariant="primary"
        />
      </Form>
    </BaseModal>
  );
};

export default AddInventoryModal; 
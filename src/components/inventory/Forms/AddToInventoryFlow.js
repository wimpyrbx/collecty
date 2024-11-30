import React, { useState } from 'react';
import { Form, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody } from '../../common/Modal';
import AddInventoryModal from './AddInventoryModal';
import axios from 'axios';

const SearchProductModal = ({ show, onHide, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        params: {
          extended: true,
          search: query
        }
      });
      const results = response.data.data || [];
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (product) => {
    onSelect(product);
    onHide();
  };

  return (
    <BaseModal show={show} onHide={onHide} size="lg">
      <BaseModalHeader icon={<FaSearch />} onHide={onHide}>
        Search Product
      </BaseModalHeader>
      <BaseModalBody>
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search for a product..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </InputGroup>

        {isSearching ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : searchQuery.length >= 2 ? (
          searchResults.length > 0 ? (
            <Row xs={1} className="g-3">
              {searchResults.map(product => (
                <Col key={product.id}>
                  <Card 
                    className="h-100 cursor-pointer hover-bg-light"
                    onClick={() => handleSelect(product)}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-start">
                        {product.productImageThumb && (
                          <img 
                            src={product.productImageThumb} 
                            alt={product.title}
                            className="me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{product.title}</h6>
                          <div className="text-muted small mb-2">
                            {product.product_group_name} • {product.product_type_name} • {product.region_name}
                          </div>
                          {product.attributes && Object.entries(product.attributes).length > 0 && (
                            <div className="small">
                              {Object.entries(product.attributes).map(([key, value], index, arr) => (
                                <span key={key}>
                                  <strong>{key}:</strong> {value}
                                  {index < arr.length - 1 ? ' • ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {product.rating_name && (
                          <span className="badge bg-secondary ms-2">{product.rating_name}</span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-4 text-muted">
              No products found matching "{searchQuery}"
            </div>
          )
        ) : searchQuery.length > 0 ? (
          <div className="text-center py-4 text-muted">
            Type at least 2 characters to search
          </div>
        ) : null}
      </BaseModalBody>
    </BaseModal>
  );
};

const AddToInventoryFlow = ({ 
  show, 
  onHide,
  onSuccess,
  initialProduct = null // Optional: If provided, skips search and goes straight to add
}) => {
  const [showSearchModal, setShowSearchModal] = useState(!initialProduct);
  const [showAddModal, setShowAddModal] = useState(!!initialProduct);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  const handleClose = () => {
    setShowSearchModal(false);
    setShowAddModal(false);
    setSelectedProduct(null);
    onHide();
  };

  const handleSuccess = () => {
    handleClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!show) return null;

  return (
    <>
      <SearchProductModal
        show={show && showSearchModal}
        onHide={handleClose}
        onSelect={handleProductSelect}
      />

      <AddInventoryModal
        show={show && showAddModal}
        onHide={handleClose}
        onSuccess={handleSuccess}
        product={selectedProduct}
      />
    </>
  );
};

export default AddToInventoryFlow; 
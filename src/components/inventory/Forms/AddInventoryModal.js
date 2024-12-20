import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import ProductAttributeBox from '../../attributes/AttributeBox';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../../common/Modal';
import './AddInventoryModal.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api';

const AddInventoryModal = ({ show, onHide, onInventoryAdded, product }) => {
  const [form, setForm] = useState({
    barcode: '',
    comment: '',
    attributes: {}
  });
  
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasActiveAttributes = attributes.length > 0;

  useEffect(() => {
    if (!show || !product) return;
    
    const loadAttributes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/attributes`);
        
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid attributes data received');
        }
        
        // Filter and process attributes
        const inventoryAttrs = data.data.filter(attr => {
          try {
            // Case-insensitive scope check
            if (!attr || attr.scope?.toUpperCase() !== 'INVENTORY') {
              return false;
            }

            // Parse IDs safely
            const typeIds = Array.isArray(attr.product_type_ids) 
              ? attr.product_type_ids 
              : JSON.parse(attr.product_type_ids || '[]');
            
            const groupIds = Array.isArray(attr.product_group_ids)
              ? attr.product_group_ids
              : JSON.parse(attr.product_group_ids || '[]');

            // Store parsed IDs
            attr.typeIds = typeIds;
            attr.groupIds = groupIds;

            const matchesType = typeIds.length === 0 || typeIds.includes(Number(product.product_type_id));
            const matchesGroup = groupIds.length === 0 || groupIds.includes(Number(product.product_group_id));

            return matchesType && matchesGroup;
          } catch (error) {
            console.error('Error processing attribute:', attr.name, error);
            return false;
          }
        });

        setAttributes(inventoryAttrs);
        
        // Set initial values
        const initialValues = {};
        inventoryAttrs.forEach(attr => {
          if (attr.default_value != null) {
            initialValues[attr.id] = attr.type === 'boolean' 
              ? (attr.default_value ? '1' : '0')
              : String(attr.default_value);
          }
        });

        setForm(prev => ({ ...prev, attributes: initialValues }));
      } catch (error) {
        console.error('Failed to load attributes:', error);
        toast.error('Failed to load attributes');
      } finally {
        setLoading(false);
      }
    };

    loadAttributes();
  }, [show, product]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setForm({ barcode: '', comment: '', attributes: {} });
      setTouched(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    // Validate required attributes
    const missingRequired = attributes
      .filter(attr => attr.is_required)
      .find(attr => !form.attributes[attr.id]);

    if (missingRequired) {
      toast.error(`${missingRequired.ui_name || missingRequired.name} is required`);
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        product_id: product.id,
        barcode: form.barcode || null,
        comment: form.comment || null,
        attributes: Object.entries(form.attributes).map(([id, value]) => ({
          attribute_id: Number(id),
          value: String(value)
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/inventory`, payload);
      
      if (response.data.success) {
        toast.success('Item added to inventory');
        onInventoryAdded?.(response.data.data);
        onHide();
      }
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <BaseModal show={show} onHide={onHide} size="lg">
      <Form onSubmit={handleSubmit}>
        <BaseModalHeader icon={<FaPlus />} onHide={onHide}>
          Add to Inventory: {product.title}
        </BaseModalHeader>

        <BaseModalBody>
          {/* Product Info */}
          <div className="product-info mb-4">
            <h6>Product Information</h6>
            <div className="product-info-grid">
              <div><strong>Title:</strong> {product.title}</div>
              <div><strong>Group:</strong> {product.product_group_name}</div>
              <div><strong>Type:</strong> {product.product_type_name}</div>
              <div><strong>Region:</strong> {product.region_name}</div>
            </div>
          </div>

          {/* Basic Fields */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  type="text"
                  value={form.barcode}
                  onChange={e => setForm(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Optional"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  type="text"
                  value={form.comment}
                  onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Optional"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Attributes Section */}
          {hasActiveAttributes && (
            <div className={`attributes-section ${hasActiveAttributes ? 'show' : ''}`}>
              <div className="section-title mb-0">
                <h5>Inventory Attributes</h5>
              </div>
              <div className="attribute-card">
                <Row>
                  {attributes.map(attribute => {
                    // Ensure we have valid arrays
                    const groupIds = Array.isArray(attribute.product_group_ids) 
                      ? attribute.product_group_ids 
                      : JSON.parse(attribute.product_group_ids || '[]');
                    
                    const typeIds = Array.isArray(attribute.product_type_ids)
                      ? attribute.product_type_ids
                      : JSON.parse(attribute.product_type_ids || '[]');

                    return (
                      <Col md={4} key={attribute.id}>
                        <ProductAttributeBox
                          attribute={{
                            ...attribute,
                            product_group_ids: groupIds,
                            product_type_ids: typeIds
                          }}
                          value={form.attributes[attribute.id]}
                          onChange={(id, value) => setForm(prev => ({
                            ...prev,
                            attributes: { ...prev.attributes, [id]: value }
                          }))}
                          touched={touched}
                          isInvalid={attribute.is_required && !form.attributes[attribute.id]}
                        />
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm me-2" />
              Loading attributes...
            </div>
          )}
        </BaseModalBody>

        <BaseModalFooter
          onCancel={onHide}
          onConfirm={handleSubmit}
          cancelText="Cancel"
          confirmText={loading ? 'Adding...' : 'Add Item'}
          isLoading={loading}
        />
      </Form>
    </BaseModal>
  );
};

export default AddInventoryModal; 
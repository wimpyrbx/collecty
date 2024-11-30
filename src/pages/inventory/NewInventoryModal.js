import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../../components/BaseModal';
import ProductSearchSelect from './ProductSearchSelect';
import InventoryAttributeBox from './InventoryAttributeBox';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const initialFormState = {
  product_id: '',
  barcode: '',
  price_override: '',
  comment: '',
  attributes: {}
};

const NewInventoryModal = ({ show, onHide, onInventoryUpdated }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [warning, setWarning] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formRef] = useState(React.createRef());
  const productSearchRef = useRef(null);

  // Fetch inventory attributes
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/attributes', {
          params: {
            scope: 'inventory',
            is_active: true
          }
        });
        setAttributes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching attributes:', error);
        toast.error('Failed to fetch attributes');
      }
    };

    if (show) {
      fetchAttributes();
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttributeChange = (attributeId, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value
      }
    }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      product_id: product.id
    }));
  };

  const validateForm = () => {
    const errors = [];
    const invalidFields = {
      required_fields: {},
      required_attributes: {}
    };

    // Required fields validation
    if (!formData.product_id) {
      errors.push('Product selection is required');
      invalidFields.required_fields.product_id = formData.product_id;
      if (productSearchRef.current) {
        productSearchRef.current.focus();
      }
    }

    // Validate required attributes
    attributes.forEach(attr => {
      if (attr.is_required) {
        const value = formData.attributes[attr.id];
        const isEmpty = attr.type === 'boolean' ? 
          value === undefined || value === null || value === '' : 
          !value;

        if (isEmpty) {
          errors.push(`${attr.ui_name} is required`);
          invalidFields.required_attributes[attr.id] = value;
        }
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/inventory', {
        product_id: formData.product_id,
        barcode: formData.barcode || null,
        price_override: formData.price_override || null,
        comment: formData.comment || null,
        attributes: Object.entries(formData.attributes).map(([id, value]) => ({
          attribute_id: Number(id),
          value: String(value)
        }))
      });

      toast.success('Inventory item added successfully');
      if (onInventoryUpdated) {
        await onInventoryUpdated();
      }
      onHide();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast.error(error.response?.data?.error || 'Failed to add inventory item');
      setWarning(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      show={show} 
      onHide={onHide}
      size="lg"
      className="new-product-modal"
    >
      <Form ref={formRef} noValidate onSubmit={handleSubmit}>
        <BaseModalHeader 
          icon={<FaPlus />}
          onHide={onHide}
        >
          Add Inventory Item
        </BaseModalHeader>

        <BaseModalBody>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Product *</Form.Label>
                <ProductSearchSelect
                  ref={productSearchRef}
                  onSelect={handleProductSelect}
                  isInvalid={hasSubmitted && !formData.product_id}
                />
                <Form.Control.Feedback type="invalid">
                  Product selection is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price Override</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price_override"
                  value={formData.price_override}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {attributes.length > 0 && (
            <div className="attributes-section">
              <div className="section-title mb-3">
                <h5>Item Attributes</h5>
              </div>
              <div className="attribute-card">
                <Row>
                  {attributes.map(attribute => (
                    <Col md={4} key={attribute.id}>
                      <InventoryAttributeBox
                        attribute={attribute}
                        value={formData.attributes[attribute.id]}
                        onChange={handleAttributeChange}
                        isInvalid={hasSubmitted && attribute.is_required && !formData.attributes[attribute.id]}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          )}

          <Row>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
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

export default NewInventoryModal; 
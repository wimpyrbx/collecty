import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaAsterisk, FaImage, FaTimesCircle } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../common/Modal';
import './AttributeModal.css';

const initialFormState = {
  ui_name: '',
  name: '',
  type: 'string',
  is_required: false,
  use_image: false,
  allowed_values: '',
  product_group_ids: [],
  product_type_ids: [],
  default_value: '',
  scope: 'product',
  is_active: true,
};

const AttributeModal = ({ 
  show, 
  onHide, 
  onAttributeSaved, 
  attribute = null, 
  productGroups,
  productTypes,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [parsedAllowedValues, setParsedAllowedValues] = useState([]);

  // Add refs for each input type
  const textInputRef = useRef(null);
  const numberInputRef = useRef(null);
  const setSelectRef = useRef(null);
  const booleanSelectRef = useRef(null);

  useEffect(() => {
    if (show && attribute && isEdit) {
      try {
        const groupIds = attribute.product_group_ids ? 
          (typeof attribute.product_group_ids === 'string' ? 
            JSON.parse(attribute.product_group_ids) : 
            attribute.product_group_ids) : 
          [];
        
        const typeIds = attribute.product_type_ids ? 
          (typeof attribute.product_type_ids === 'string' ? 
            JSON.parse(attribute.product_type_ids) : 
            attribute.product_type_ids) : 
          [];

        // Parse and format allowed values
        let formattedAllowedValues = '';
        if (attribute.allowed_values) {
          try {
            const parsedValues = JSON.parse(attribute.allowed_values);
            formattedAllowedValues = parsedValues.join(', ');
            setParsedAllowedValues(parsedValues);
          } catch (e) {
            formattedAllowedValues = attribute.allowed_values;
            setParsedAllowedValues([]);
          }
        }

        setFormData({
          ...initialFormState,
          ...attribute,
          product_group_ids: groupIds,
          product_type_ids: typeIds,
          allowed_values: formattedAllowedValues,
          default_value: attribute.default_value || '',
          ui_name: attribute.ui_name || '',
          name: attribute.name || '',
          type: attribute.type || 'string',
          is_active: attribute.is_active === 1 || attribute.is_active === true,
          is_required: attribute.is_required === 1 || attribute.is_required === true,
          use_image: attribute.use_image === 1 || attribute.use_image === true
        });

      } catch (err) {
        console.error('Error parsing attribute data:', err);
        setFormData({
          ...initialFormState,
          ...attribute,
          product_group_ids: [],
          product_type_ids: [],
          is_active: attribute.is_active === 1 || attribute.is_active === true
        });
      }
    } else if (show) {
      setFormData(initialFormState);
      setParsedAllowedValues([]);
    }
    setHasSubmitted(false);
  }, [show, attribute, isEdit]);

  // Convert arrays to react-select format
  const productGroupOptions = productGroups.map(group => ({
    value: group.id,
    label: group.name
  }));

  const productTypeOptions = productTypes.map(type => ({
    value: type.id,
    label: type.name
  }));

  // Modified handleInputChange to handle multi-select
  const handleInputChange = (e) => {
    if (!e) return;

    const { name, value, type, checked } = e.target;
    
    if (name === 'allowed_values') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        default_value: ''
      }));

      try {
        const values = value.split(',').map(v => v.trim()).filter(v => v);
        setParsedAllowedValues(values);
      } catch (err) {
        setParsedAllowedValues([]);
      }
    } else if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        allowed_values: '',
        default_value: ''
      }));
      setParsedAllowedValues([]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Handle is_required change
    if (name === 'is_required' && checked) {
      // Focus the appropriate input based on the attribute type
      setTimeout(() => {
        switch (formData.type) {
          case 'string':
            textInputRef.current?.focus();
            break;
          case 'number':
            numberInputRef.current?.focus();
            break;
          case 'set':
            setSelectRef.current?.focus();
            break;
          case 'boolean':
            booleanSelectRef.current?.focus();
            break;
        }
      }, 0);
    }
  };

  const validateForm = () => {
    if (!formData.ui_name || !formData.name) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.type === 'set' && !formData.allowed_values) {
      toast.error('Allowed values are required for Set type');
      return false;
    }

    if (!formData.product_group_ids?.length) {
      toast.error('Please select at least one Product Group');
      return false;
    }

    if (!formData.product_type_ids?.length) {
      toast.error('Please select at least one Product Type');
      return false;
    }

    return true;
  };

  const renderDefaultValueInput = () => {
    switch (formData.type) {
      case 'boolean':
        return (
          <Form.Select
            ref={booleanSelectRef}
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
          >
            <option value="">Select Default Value</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </Form.Select>
        );

      case 'set':
        return (
          <Form.Select
            ref={setSelectRef}
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
          >
            <option value="">Select Default Value</option>
            {parsedAllowedValues.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Form.Select>
        );

      case 'number':
        return (
          <Form.Control
            ref={numberInputRef}
            type="number"
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
          />
        );

      default:
        return (
          <Form.Control
            ref={textInputRef}
            type="text"
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
          />
        );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const allowedValuesArray = formData.type === 'set' && formData.allowed_values
        ? formData.allowed_values.split(',').map(v => v.trim()).filter(v => v)
        : [];

      const payload = {
        ...formData,
        product_group_ids: formData.product_group_ids,
        product_type_ids: formData.product_type_ids,
        allowed_values: formData.type === 'set' ? JSON.stringify(allowedValuesArray) : '',
        default_value: formData.default_value || '',
        ui_name: formData.ui_name || '',
        name: formData.name || '',
        type: formData.type || 'string',
        is_required: Boolean(formData.is_required),
        use_image: Boolean(formData.use_image),
        is_active: Boolean(formData.is_active),
        scope: formData.scope || 'product'
      };

      console.log('=== ATTRIBUTE SUBMIT ===');
      console.log('Is Edit Mode:', isEdit);
      console.log('Attribute ID:', attribute?.id);
      console.log('Payload:', payload);
      console.log('URL:', isEdit ? `http://localhost:5000/api/attributes/${attribute.id}` : 'http://localhost:5000/api/attributes');
      console.log('Method:', isEdit ? 'PUT' : 'POST');

      if (isEdit) {
        const response = await axios.put(`http://localhost:5000/api/attributes/${attribute.id}`, payload);
        console.log('Response:', response.data);
        onHide();
        setTimeout(() => {
          toast.success(`${formData.scope} attribute "${formData.name}" updated successfully`, {
            duration: 2000,
            position: 'top-right'
          });
        }, 100);
      } else {
        await axios.post('http://localhost:5000/api/attributes', payload);
        onHide(); // Close modal first
        setTimeout(() => {
          toast.success(`${formData.scope} attribute "${formData.name}" created successfully`, {
            duration: 2000,
            position: 'top-right'
          });
        }, 100);
      }

      onAttributeSaved();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      console.error('Error response:', err.response?.data);
      setTimeout(() => {
        toast.error(err.response?.data?.error || 'Failed to save attribute', {
          duration: 2000,
          position: 'top-right'
        });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      show={show} 
      onHide={onHide}
      size="lg"
      className="attribute-modal"
    >
      <Form onSubmit={handleSubmit}>
        <BaseModalHeader 
          icon={isEdit ? <FaEdit /> : <FaPlus />}
          onHide={onHide}
        >
          {isEdit && attribute ? 
            `Editing ${attribute.scope.charAt(0).toUpperCase() + attribute.scope.slice(1)}: ${attribute.name}`
            : 'Add Attribute'
          }
        </BaseModalHeader>

        <BaseModalBody>
          <Row className="mb-3">
            {!isEdit && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Scope *</Form.Label>
                  <Form.Select
                    name="scope"
                    value={formData.scope}
                    onChange={handleInputChange}
                    required
                    isInvalid={hasSubmitted && !formData.scope}
                  >
                    <option value="product">Product</option>
                    <option value="inventory">Inventory</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Scope is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={isEdit ? 6 : 5}>
              <Form.Group>
                <Form.Label>Display Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="ui_name"
                  value={formData.ui_name}
                  onChange={handleInputChange}
                  isInvalid={hasSubmitted && !formData.ui_name}
                />
                <Form.Control.Feedback type="invalid">
                  Required field
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={isEdit ? 6 : 4}>
              <Form.Group>
                <Form.Label>Internal Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={hasSubmitted && !formData.name}
                />
                <Form.Control.Feedback type="invalid">
                  Required field
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Type *</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="string">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Yes/No</option>
                  <option value="set">Set of Values</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Default Value {formData.is_required && '*'}
                </Form.Label>
                {renderDefaultValueInput()}
              </Form.Group>
            </Col>
          </Row>

          {formData.type === 'set' && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Allowed Values (comma-separated) *</Form.Label>
                  <Form.Control
                    type="text"
                    name="allowed_values"
                    value={formData.allowed_values}
                    onChange={handleInputChange}
                    placeholder="value1, value2, value3"
                    isInvalid={hasSubmitted && formData.type === 'set' && !formData.allowed_values}
                  />
                  <Form.Control.Feedback type="invalid">
                    Required for Set type
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product Groups *</Form.Label>
                <Form.Select
                  multiple
                  name="product_group_ids"
                  value={formData.product_group_ids || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                    setFormData(prev => ({
                      ...prev,
                      product_group_ids: selectedOptions
                    }));
                  }}
                  style={{ height: `${productGroups.length * 24}px` }}
                  isInvalid={hasSubmitted && !formData.product_group_ids?.length}
                >
                  {productGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select at least one Product Group
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product Types *</Form.Label>
                <Form.Select
                  multiple
                  name="product_type_ids"
                  value={formData.product_type_ids || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                    setFormData(prev => ({
                      ...prev,
                      product_type_ids: selectedOptions
                    }));
                  }}
                  style={{ height: `${productTypes.length * 24}px` }}
                  isInvalid={hasSubmitted && !formData.product_type_ids?.length}
                >
                  {productTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select at least one Product Type
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Required</Form.Label>
                <Form.Check
                  type="checkbox"
                  name="is_required"
                  checked={formData.is_required}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Use Image</Form.Label>
                <Form.Check
                  type="checkbox"
                  name="use_image"
                  checked={formData.use_image}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Active</Form.Label>
                <Form.Check
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
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
          confirmText={loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
          isLoading={loading}
        />
      </Form>
    </BaseModal>
  );
};

export default AttributeModal; 
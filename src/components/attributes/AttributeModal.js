import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
  scope: 'product'
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

        setFormData({
          ...initialFormState,
          ...attribute,
          product_group_ids: groupIds,
          product_type_ids: typeIds,
          allowed_values: attribute.allowed_values || '',
          default_value: attribute.default_value || '',
          ui_name: attribute.ui_name || '',
          name: attribute.name || '',
          type: attribute.type || 'string'
        });

        // Parse allowed values if they exist
        if (attribute.allowed_values) {
          try {
            setParsedAllowedValues(JSON.parse(attribute.allowed_values));
          } catch (e) {
            setParsedAllowedValues([]);
          }
        }
      } catch (err) {
        console.error('Error parsing attribute data:', err);
        setFormData({
          ...initialFormState,
          ...attribute,
          product_group_ids: [],
          product_type_ids: [],
        });
      }
    } else if (show) {
      setFormData(initialFormState);
      setParsedAllowedValues([]);
    }
    setHasSubmitted(false);
  }, [show, attribute, isEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'product_group_id' || name === 'product_type_id') {
      const arrayFieldName = `${name}s`;
      setFormData(prev => ({
        ...prev,
        [arrayFieldName]: value ? [parseInt(value, 10)] : []
      }));
    } else if (name === 'allowed_values') {
      // Store raw input value
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset default value when allowed values change
        default_value: ''
      }));

      // Parse for dropdown options
      try {
        const values = value.split(',').map(v => v.trim()).filter(v => v);
        setParsedAllowedValues(values);
      } catch (e) {
        setParsedAllowedValues([]);
      }
    } else if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset values when type changes
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
  };

  const validateForm = () => {
    if (!formData.ui_name || !formData.name) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.is_required && !formData.default_value) {
      toast.error('Default value is required when field is marked as required');
      return false;
    }

    if (formData.type === 'set' && !formData.allowed_values) {
      toast.error('Allowed values are required for Set type');
      return false;
    }

    return true;
  };

  const renderDefaultValueInput = () => {
    switch (formData.type) {
      case 'boolean':
        return (
          <Form.Select
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
            isInvalid={hasSubmitted && formData.is_required && !formData.default_value}
            required={formData.is_required}
          >
            <option value="">Select Default Value</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </Form.Select>
        );

      case 'set':
        // Get the allowed values from the comma-separated string
        const allowedValues = formData.allowed_values ? 
          formData.allowed_values.split(',')
            .map(v => v.trim())
            .filter(v => v !== '') : 
          [];

        return (
          <Form.Select
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
            isInvalid={hasSubmitted && formData.is_required && !formData.default_value}
            required={formData.is_required}
          >
            <option value="">Select Default Value</option>
            {allowedValues.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Form.Select>
        );

      case 'number':
        return (
          <Form.Control
            type="number"
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
            isInvalid={hasSubmitted && formData.is_required && !formData.default_value}
            required={formData.is_required}
          />
        );

      case 'string':
      default:
        return (
          <Form.Control
            type="text"
            name="default_value"
            value={formData.default_value}
            onChange={handleInputChange}
            isInvalid={hasSubmitted && formData.is_required && !formData.default_value}
            required={formData.is_required}
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
      // Convert allowed_values to JSON array format before sending
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
        scope: 'product'
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/attributes/${attribute.id}`, payload);
        toast.success('Attribute updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/attributes', payload);
        toast.success('Attribute created successfully');
      }

      onAttributeSaved();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save attribute');
      console.error('Error saving attribute:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{isEdit ? 'Edit' : 'Add'} Attribute</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
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
            <Col md={6}>
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
                <Form.Label>Product Groups</Form.Label>
                <Form.Select
                  name="product_group_id"
                  value={formData.product_group_ids?.[0] || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select Product Group</option>
                  {productGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product Types</Form.Label>
                <Form.Select
                  name="product_type_id"
                  value={formData.product_type_ids?.[0] || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select Product Type</option>
                  {productTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="switch"
                id="is_required"
                name="is_required"
                label="Required Field"
                checked={formData.is_required}
                onChange={handleInputChange}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="use_image"
                name="use_image"
                label="Use Image"
                checked={formData.use_image}
                onChange={handleInputChange}
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AttributeModal; 
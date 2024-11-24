import React from 'react';
import { Form } from 'react-bootstrap';
import './ProductAttributeBox.css';

const ProductAttributeBox = ({ attribute, value, onChange, touched, isInvalid }) => {
  const handleBoxClick = (e) => {
    if (attribute.type === 'boolean') {
      onChange(attribute.id, value !== '1' ? '1' : '0');
    }
  };

  const renderInput = () => {
    switch (attribute.type) {
      case 'boolean':
        return (
          <Form.Check
            type="switch"
            id={`switch-${attribute.id}`}
            className="custom-switch"
            checked={value === '1'}
            onChange={(e) => onChange(attribute.id, e.target.checked ? '1' : '0')}
            onClick={(e) => e.stopPropagation()} // Prevent double-triggering
          />
        );
      
      case 'set':
        const allowedValues = JSON.parse(attribute.allowed_values || '[]');
        return (
          <Form.Select
            value={value || ''}
            onChange={(e) => onChange(attribute.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Select {attribute.ui_name}</option>
            {allowedValues.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Form.Select>
        );

      case 'number':
        return (
          <Form.Control
            type="number"
            value={value || ''}
            onChange={(e) => onChange(attribute.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        );

      default: // string
        return (
          <Form.Control
            type="text"
            value={value || ''}
            onChange={(e) => onChange(attribute.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        );
    }
  };

  return (
    <div 
      className={`attribute-box ${value === '1' && attribute.type === 'boolean' ? 'active' : ''}`}
      onClick={handleBoxClick}
    >
      <Form.Group className="attribute-content">
        <Form.Label>
          {attribute.ui_name}
          {attribute.is_required && ' *'}
        </Form.Label>
        {renderInput()}
        {touched && isInvalid && (
          <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
            This field is required
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </div>
  );
};

export default ProductAttributeBox; 
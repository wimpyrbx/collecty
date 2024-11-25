import React from 'react';
import { Form } from 'react-bootstrap';
import './ProductAttributeBox.css';

const ProductAttributeBox = ({ attribute, value, onChange, touched, isInvalid }) => {
  const handleBoxClick = (e) => {
    if (attribute.type === 'boolean') {
      onChange(attribute.id, value === '1' ? '0' : '1');
    } else {
      const input = e.currentTarget.querySelector('input, select');
      if (input) {
        input.focus();
      }
    }
  };

  const renderInput = () => {
    switch (attribute.type) {
      case 'boolean':
        return (
          <Form.Check
            type="switch"
            checked={value === '1'}
            onChange={(e) => onChange(attribute.id, e.target.checked ? '1' : '0')}
            className="custom-switch"
          />
        );
      
      case 'set':
        const allowedValues = JSON.parse(attribute.allowed_values || '[]');
        return (
          <Form.Select
            value={value || ''}
            onChange={(e) => onChange(attribute.id, e.target.value)}
            required={attribute.is_required}
          >
            <option value="">Select {attribute.ui_name}</option>
            {allowedValues.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </Form.Select>
        );
      
      case 'number':
        return (
          <Form.Control
            type="number"
            value={value || ''}
            onChange={(e) => onChange(attribute.id, e.target.value)}
            required={attribute.is_required}
          />
        );
      
      case 'string':
      default:
        return (
          <Form.Control
            type="text"
            value={value || ''}
            onChange={(e) => onChange(attribute.id, e.target.value)}
            required={attribute.is_required}
          />
        );
    }
  };

  const isActive = (attribute.type === 'boolean' && value === '1') || (value && attribute.type !== 'boolean');

  return (
    <div 
      className={`attribute-box ${isActive ? 'active' : ''}`}
      onClick={handleBoxClick}
    >
      <Form.Group className="attribute-content">
        <Form.Label>
          {attribute.ui_name}
        </Form.Label>
        {renderInput()}
        {touched && isInvalid && (
          <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
            * Required
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </div>
  );
};

export default ProductAttributeBox; 
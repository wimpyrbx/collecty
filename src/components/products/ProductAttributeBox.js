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
          <div className="switch-container">
            <label className="form-label">
              {attribute.name}
              {attribute.is_required && <span className="text-danger">*</span>}
            </label>
            <div className="form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={value || false}
                onChange={(e) => onChange(attribute.id, e.target.checked)}
              />
            </div>
          </div>
        );
      
      case 'set':
        let allowedValues = [];
        try {
          // Parse the JSON string of allowed values
          allowedValues = JSON.parse(attribute.allowed_values);
        } catch (e) {
          console.error('Error parsing allowed values:', e);
        }

        return (
          <Form.Select
            value={value || ''}
            onChange={(e) => onChange(attribute.id, e.target.value)}
            required={attribute.is_required}
            className="set-select"
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

  const isActive = value && value !== '0';

  return (
    <div className={`attribute-box ${attribute.is_required ? 'required' : ''}`}>
      {attribute.type === 'boolean' ? (
        <div className="switch-container">
          <label className="form-label">
            {attribute.name}
            {attribute.is_required && <span className="text-danger">*</span>}
          </label>
          <div className="form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              checked={value || false}
              onChange={(e) => onChange(attribute.id, e.target.checked)}
            />
          </div>
        </div>
      ) : (
        <>
          <label className="form-label">
            {attribute.name}
            {attribute.is_required && <span className="text-danger">*</span>}
          </label>
          {attribute.type === 'set' ? (
            <Form.Select
              value={value || ''}
              onChange={(e) => onChange(attribute.id, e.target.value)}
              isInvalid={isInvalid}
            >
              <option value="">Select {attribute.name}</option>
              {attribute.set_values?.split(',').map(value => (
                <option key={value.trim()} value={value.trim()}>
                  {value.trim()}
                </option>
              ))}
            </Form.Select>
          ) : (
            <Form.Control
              type={attribute.type === 'number' ? 'number' : 'text'}
              value={value || ''}
              onChange={(e) => onChange(attribute.id, e.target.value)}
              isInvalid={isInvalid}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductAttributeBox; 
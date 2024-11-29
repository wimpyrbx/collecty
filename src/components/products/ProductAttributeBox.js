import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './ProductAttributeBox.css';

const ProductAttributeBox = ({ attribute, value, onChange, touched, isInvalid }) => {
  // Only set default value for required attributes that are NOT set type
  useEffect(() => {
    if (attribute.type !== 'set' && attribute.is_required && !value && attribute.default_value !== undefined) {
      // For boolean type, convert default_value to actual boolean
      if (attribute.type === 'boolean') {
        onChange(attribute.id, attribute.default_value === '1' || attribute.default_value === true);
      } else {
        onChange(attribute.id, attribute.default_value);
      }
    }
  }, [attribute, value, onChange]);

  const renderInput = () => {
    const isEmptyRequired = attribute.is_required && (!value || value === '');
    const boxClassName = `attribute-box ${value ? 'has-value' : ''} ${isEmptyRequired ? 'is-invalid' : ''}`;

    switch (attribute.type) {
      case 'boolean':
        const boolValue = value === true || value === '1' || value === 1;
        return (
          <div 
            className={`attribute-box switch-box ${boolValue ? 'active' : 'inactive'}`}
            onClick={() => onChange(attribute.id, !boolValue)}
          >
            <span className={`switch-status ${boolValue ? 'success' : 'danger'}`}>
              {boolValue ? (
                <>
                  <FaCheck />
                  <span>Yes</span>
                </>
              ) : (
                <>
                  <FaTimes />
                  <span>No</span>
                </>
              )}
            </span>
            <div className="switch-content">
              <span className="attribute-name">{attribute.ui_name || attribute.name}</span>
            </div>
          </div>
        );
      
      case 'set':
        let setValues = [];
        try {
          if (attribute.allowed_values) {
            setValues = JSON.parse(attribute.allowed_values);
          } else if (attribute.set_values) {
            setValues = attribute.set_values.split(',').map(v => v.trim());
          }
        } catch (e) {
          console.error('Error parsing values for attribute:', attribute.name, e);
        }

        return (
          <div className={boxClassName}>
            <label className="form-label">
              {attribute.ui_name || attribute.name}
              {attribute.is_required && <span className="text-danger">*</span>}
            </label>
            <Form.Select
              value={value || ''}
              onChange={(e) => onChange(attribute.id, e.target.value)}
              isInvalid={isInvalid || isEmptyRequired}
            >
              <option value="">Choose a value</option>
              {setValues.map(val => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </Form.Select>
          </div>
        );
      
      default:
        return (
          <div className={boxClassName}>
            <label className="form-label">
              {attribute.ui_name || attribute.name}
              {attribute.is_required === 1 && <span className="text-danger">*</span>}
            </label>
            <Form.Control
              type={attribute.type === 'number' ? 'number' : 'text'}
              value={value || ''}
              onChange={(e) => onChange(attribute.id, e.target.value)}
              isInvalid={isInvalid || isEmptyRequired}
              placeholder={``} // no placeholder wanted for these
            />
          </div>
        );
    }
  };

  return renderInput();
};

export default ProductAttributeBox; 
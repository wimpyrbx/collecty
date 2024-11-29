import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './ProductAttributeBox.css';

const ProductAttributeBox = ({ attribute, value, onChange, touched, isInvalid }) => {
  // Only set default value once when component mounts
  useEffect(() => {
    if (attribute.type !== 'set' && attribute.is_required && attribute.default_value !== undefined && !value) {
      // For boolean type, convert default_value to actual boolean
      if (attribute.type === 'boolean') {
        const defaultBool = attribute.default_value === '1' || attribute.default_value === true;
        onChange(attribute.id, defaultBool);
      } else {
        onChange(attribute.id, attribute.default_value);
      }
    }
  }, [attribute.id, attribute.type, attribute.is_required, attribute.default_value]);

  const renderInput = () => {
    const isEmptyRequired = attribute.is_required && (!value || value === '');
    const boxClassName = `p-2 attribute-box ${value ? 'has-value' : ''} ${isEmptyRequired ? 'is-invalid' : ''}`;

    switch (attribute.type) {
      case 'boolean':
        // Convert value to boolean, default to false if undefined
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
            <div className="input-wrapper">
              <Form.Control
                type={attribute.type === 'number' ? 'number' : 'text'}
                value={value || ''}
                onChange={(e) => onChange(attribute.id, e.target.value)}
                isInvalid={isInvalid || isEmptyRequired}
                className={value ? 'has-clear-button' : ''}
              />
              {value && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={() => onChange(attribute.id, '')}
                  tabIndex={-1}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        );
    }
  };

  return renderInput();
};

export default ProductAttributeBox; 
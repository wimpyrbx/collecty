import React from 'react';
import { Form } from 'react-bootstrap';
import './InventoryAttributeBox.css';

const InventoryAttributeBox = ({ attribute, value, onChange, isInvalid }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    if (attribute.type === 'boolean') {
      newValue = e.target.checked ? '1' : '0';
    }
    onChange(attribute.id, newValue);
  };

  const renderInput = () => {
    switch (attribute.type) {
      case 'boolean':
        return (
          <Form.Check
            type="switch"
            checked={value === '1'}
            onChange={handleChange}
            isInvalid={isInvalid}
          />
        );

      case 'set':
        const allowedValues = JSON.parse(attribute.allowed_values || '[]');
        return (
          <Form.Select
            value={value || ''}
            onChange={handleChange}
            isInvalid={isInvalid}
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
            onChange={handleChange}
            isInvalid={isInvalid}
          />
        );

      default:
        return (
          <Form.Control
            type="text"
            value={value || ''}
            onChange={handleChange}
            isInvalid={isInvalid}
          />
        );
    }
  };

  return (
    <div className="inventory-attribute-box">
      <Form.Group>
        <Form.Label>
          {attribute.ui_name}
          {attribute.is_required && <span className="text-danger">*</span>}
        </Form.Label>
        {renderInput()}
        {attribute.description && (
          <Form.Text className="text-muted">
            {attribute.description}
          </Form.Text>
        )}
      </Form.Group>
    </div>
  );
};

export default InventoryAttributeBox; 
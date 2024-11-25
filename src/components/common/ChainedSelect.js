import React from 'react';
import { Form } from 'react-bootstrap';

const ChainedSelect = ({
  name,
  value,
  onChange,
  options,
  label,
  disabled = false,
  isRequired = false,
  isInvalid = false
}) => {
  return (
    <Form.Group>
      <Form.Label>{label} {isRequired && '*'}</Form.Label>
      <Form.Select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        isInvalid={isInvalid}
      >
        <option value="">{`Select ${label}`}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>{option.name}</option>
        ))}
      </Form.Select>
      {isInvalid && (
        <Form.Control.Feedback type="invalid">
          * Required
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default ChainedSelect; 
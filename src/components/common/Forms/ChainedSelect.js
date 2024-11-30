import React, { forwardRef, useEffect } from 'react';
import { Form } from 'react-bootstrap';

const ChainedSelect = forwardRef(({
  name,
  value,
  onChange,
  options,
  label,
  disabled = false,
  isRequired = false,
  isInvalid = false,
  autoFocus = false,
  feedback
}, ref) => {
  useEffect(() => {
    if (ref && ref.current && autoFocus && !disabled && options.length > 0) {
      ref.current.focus();
    }
  }, [ref, disabled, options, autoFocus]);

  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        isInvalid={isInvalid}
        required={isRequired}
      >
        <option value="">{`Select ${label}`}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Form.Select>
      {isInvalid && (
        <Form.Control.Feedback type="invalid">
          {feedback || `${label} is required`}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
});

export default ChainedSelect; 
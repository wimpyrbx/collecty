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
  autoFocus = false
}, ref) => {
  useEffect(() => {
    if (ref && ref.current && autoFocus && !disabled && options.length > 0) {
      ref.current.focus();
    }
  }, [ref, disabled, options, autoFocus]);

  return (
    <Form.Group>
      <Form.Label>{label} {isRequired && '*'}</Form.Label>
      <Form.Select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        isInvalid={isInvalid}
      >
        <option value="">{`Select ${label}`}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
});

export default ChainedSelect; 
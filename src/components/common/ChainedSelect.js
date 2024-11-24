import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';

const ChainedSelect = ({
  name,
  value,
  onChange,
  options,
  label,
  isRequired,
  isInvalid,
  disabled,
  placeholder = "Select...",
  onAutoProgress,
  autoProgressThreshold = 1,
  focusOnChange = true
}) => {
  const selectRef = useRef(null);
  const autoProgressedRef = useRef(false);

  useEffect(() => {
    // Reset the flag when options change
    autoProgressedRef.current = false;
  }, [options]);

  useEffect(() => {
    // Only auto-progress if we haven't already and have exactly one option
    if (!autoProgressedRef.current && 
        options.length === autoProgressThreshold && 
        onAutoProgress && 
        !value) {
      autoProgressedRef.current = true;
      onAutoProgress(options[0]?.id);
    }
  }, [options, onAutoProgress, autoProgressThreshold, value]);

  const focusNextSelect = () => {
    if (!focusOnChange) return;
    
    const currentSelect = selectRef.current;
    if (currentSelect) {
      const form = currentSelect.closest('form');
      if (form) {
        const selects = Array.from(form.querySelectorAll('select'));
        const currentIndex = selects.indexOf(currentSelect);
        const nextSelect = selects
          .slice(currentIndex + 1)
          .find(select => !select.disabled);
        
        if (nextSelect) {
          setTimeout(() => nextSelect.focus(), 0);
        }
      }
    }
  };

  const handleChange = (e) => {
    onChange(e);
    
    // If this select has been filled and there's an auto-progress handler
    if (e.target.value && onAutoProgress) {
      onAutoProgress(e.target.value);
      focusNextSelect();
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter key
    if (e.key === 'Enter' && selectRef.current) {
      const select = selectRef.current;
      const selectedOption = select.options[select.selectedIndex];
      if (selectedOption && selectedOption.value) {
        handleChange({
          target: {
            name: name,
            value: selectedOption.value
          }
        });
      }
    }
  };

  // Handle keyboard selection changes
  const handleKeyUp = (e) => {
    // Ignore special keys
    if (['Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'Escape'].includes(e.key)) {
      return;
    }

    const select = selectRef.current;
    if (select && select.value !== value) {
      handleChange({
        target: {
          name: name,
          value: select.value
        }
      });
    }
  };

  // Watch for value changes from parent
  useEffect(() => {
    if (value && focusOnChange) {
      focusNextSelect();
    }
  }, [value, focusOnChange]);

  return (
    <Form.Group>
      <Form.Label>
        {label}
        {isRequired && ' *'}
      </Form.Label>
      <Form.Select
        ref={selectRef}
        name={name}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        isInvalid={isInvalid}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Form.Select>
      <Form.Control.Feedback type="invalid">
        {`Please select ${label.toLowerCase()}`}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default ChainedSelect; 
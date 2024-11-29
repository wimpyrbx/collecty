import React from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes } from 'react-icons/fa'; // Default icons
import './ToggleButton.css';

const ToggleButton = ({
  label,
  value,
  onChange,
  name,
  yesText = 'Yes',
  noText = 'No',
  yesVariant = 'success',
  noVariant = 'danger',
  disabled = false,
  useIcons = false,
  yesIcon = <FaCheck />,
  noIcon = <FaTimes />
}) => {
  const renderStatus = () => {
    if (useIcons) {
      return (
        <span className={`toggle-status ${value ? yesVariant : noVariant}`}>
          {value ? yesIcon : noIcon}
          <span className="toggle-status-text ms-1">
            {value ? yesText : noText}
          </span>
        </span>
      );
    }
    
    return (
      <span className={`toggle-status ${value ? yesVariant : noVariant}`}>
        {value ? yesText : noText}
      </span>
    );
  };

  return (
    <div className="toggle-button-wrapper">
      <button
        type="button"
        className={`toggle-button toggle-status-${value ? yesVariant : noVariant}`}
        onClick={() => {
          if (!disabled) {
            onChange({
              target: {
                name,
                type: 'checkbox',
                checked: !value
              }
            });
          }
        }}
        disabled={disabled}
        data-active={value}
      >
        <span className="toggle-label">{label}</span>
        {renderStatus()}
      </button>
    </div>
  );
};

ToggleButton.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  yesText: PropTypes.string,
  noText: PropTypes.string,
  yesVariant: PropTypes.string,
  noVariant: PropTypes.string,
  disabled: PropTypes.bool,
  useIcons: PropTypes.bool,
  yesIcon: PropTypes.node,
  noIcon: PropTypes.node
};

export default ToggleButton; 
import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import './ToggleButtonContainer.css';

const ToggleButtonContainer = ({
  title = 'Settings',
  children,
  headerBgClass = 'bg-primary',
  headerTextClass = 'text-white',
  className = '',
  noGutters = true
}) => {
  return (
    <div className={`toggle-button-section ${className}`}>
      <h6 className={`section-title ${headerBgClass} ${headerTextClass}`}>
        {title}
      </h6>
      <div className="toggle-button-container">
        <Row className={noGutters ? 'g-2' : ''}>
          {children}
        </Row>
      </div>
    </div>
  );
};

ToggleButtonContainer.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  headerBgClass: PropTypes.string,
  headerTextClass: PropTypes.string,
  className: PropTypes.string,
  noGutters: PropTypes.bool
};

export default ToggleButtonContainer; 
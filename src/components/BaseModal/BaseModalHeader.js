import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const BaseModalHeader = ({
  variant = 'primary',
  icon,
  children,
  showClose = true,
  onHide,
  className = '',
  ...props
}) => {
  return (
    <Modal.Header 
      closeButton={showClose} 
      onHide={onHide}
      className={`bg-${variant} text-white ${className}`}
      {...props}
    >
      <Modal.Title className="d-flex align-items-center gap-2">
        {icon && <span className="modal-icon">{icon}</span>}
        {children}
      </Modal.Title>
    </Modal.Header>
  );
};

BaseModalHeader.propTypes = {
  variant: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node,
  showClose: PropTypes.bool,
  onHide: PropTypes.func,
  className: PropTypes.string
};

export default BaseModalHeader; 
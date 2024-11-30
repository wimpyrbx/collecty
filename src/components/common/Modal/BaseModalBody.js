import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const BaseModalBody = ({
  variant = 'light',
  children,
  className = '',
  ...props
}) => {
  return (
    <Modal.Body 
      className={`bg-${variant} ${className}`}
      {...props}
    >
      {children}
    </Modal.Body>
  );
};

BaseModalBody.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string
};

export default BaseModalBody; 
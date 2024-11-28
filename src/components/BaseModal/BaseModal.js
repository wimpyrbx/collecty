import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './BaseModal.css';

const BaseModal = ({
  show,
  onHide,
  size = 'lg',
  centered = true,
  keyboard = true,
  backdrop = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      keyboard={keyboard}
      backdrop={backdrop}
      className={`base-modal ${className}`}
      {...props}
    >
      {children}
    </Modal>
  );
};

BaseModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['sm', 'lg', 'xl']),
  centered: PropTypes.bool,
  keyboard: PropTypes.bool,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['static'])]),
  className: PropTypes.string,
  children: PropTypes.node
};

export default BaseModal; 
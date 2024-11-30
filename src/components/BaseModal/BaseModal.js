import React from 'react';
import { Modal } from 'react-bootstrap';
import './BaseModal.css';

const BaseModal = ({ children, className = '', ...props }) => {
  return (
    <Modal
      {...props}
      className={`base-modal ${className}`}
      centered
    >
      {children}
    </Modal>
  );
};

export default BaseModal; 
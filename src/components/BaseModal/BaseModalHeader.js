import React from 'react';
import { Modal } from 'react-bootstrap';

const BaseModalHeader = ({ children, icon, onHide }) => {
  return (
    <Modal.Header closeButton onHide={onHide}>
      <Modal.Title>
        {icon && <span className="modal-icon me-2">{icon}</span>}
        {children}
      </Modal.Title>
    </Modal.Header>
  );
};

export default BaseModalHeader; 
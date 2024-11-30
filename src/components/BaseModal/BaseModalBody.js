import React from 'react';
import { Modal } from 'react-bootstrap';

const BaseModalBody = ({ children }) => {
  return (
    <Modal.Body>
      {children}
    </Modal.Body>
  );
};

export default BaseModalBody; 
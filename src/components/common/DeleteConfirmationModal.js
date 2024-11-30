import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message,
  isLoading 
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="delete-confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaExclamationTriangle className="text-danger me-2" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal; 
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const BaseModalFooter = ({ 
  onCancel, 
  onConfirm, 
  cancelText = 'Cancel', 
  confirmText = 'Confirm',
  isLoading = false
}) => {
  return (
    <Modal.Footer>
      <Button 
        variant="secondary" 
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button 
        variant="primary" 
        onClick={onConfirm}
        disabled={isLoading}
      >
        {confirmText}
      </Button>
    </Modal.Footer>
  );
};

export default BaseModalFooter; 
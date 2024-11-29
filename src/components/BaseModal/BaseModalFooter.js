import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const BaseModalFooter = ({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  isLoading = false,
  cancelVariant = 'warning',
  confirmVariant = 'success',
  ...props
}) => {
  return (
    <Modal.Footer {...props} className="d-flex justify-content-between">
      <Button 
        variant={cancelVariant} 
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button 
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {confirmText}
      </Button>
    </Modal.Footer>
  );
};

BaseModalFooter.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  isLoading: PropTypes.bool,
  cancelVariant: PropTypes.string,
  confirmVariant: PropTypes.string
};

export default BaseModalFooter; 
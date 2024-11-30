import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const BaseModalFooter = ({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  isLoading = false,
  cancelVariant = 'secondary',
  confirmVariant = 'success',
  debugButton = null
}) => {
  return (
    <Modal.Footer className="d-flex justify-content-between">
      <div>
        <Button 
          variant={cancelVariant} 
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
      </div>
      <div className="d-flex">
        <Button 
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading}
          className="me-2"
        >
          {confirmText}
        </Button>
        {debugButton}
      </div>
    </Modal.Footer>
  );
};

BaseModalFooter.displayName = 'BaseModalFooter';

BaseModalFooter.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  isLoading: PropTypes.bool,
  cancelVariant: PropTypes.string,
  confirmVariant: PropTypes.string,
  debugButton: PropTypes.node
};

export default BaseModalFooter; 
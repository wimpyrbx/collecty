import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const BaseModalFooter = ({
  variant = 'primary',
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  cancelVariant = 'secondary',
  confirmVariant = 'success',
  showCancel = true,
  showConfirm = true,
  isLoading = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <Modal.Footer 
      className={`bg-${variant} text-white ${className}`}
      {...props}
    >
      {children || (
        <>
          {showCancel && (
            <Button 
              variant={cancelVariant} 
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          {showConfirm && (
            <Button 
              variant={confirmVariant} 
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : confirmText}
            </Button>
          )}
        </>
      )}
    </Modal.Footer>
  );
};

BaseModalFooter.propTypes = {
  variant: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  cancelVariant: PropTypes.string,
  confirmVariant: PropTypes.string,
  showCancel: PropTypes.bool,
  showConfirm: PropTypes.bool,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};

export default BaseModalFooter; 
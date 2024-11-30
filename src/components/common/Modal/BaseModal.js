import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaTable, FaCode, FaBug, FaAsterisk } from 'react-icons/fa';
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
  debugFormData = false,
  formData = {},
  ...props
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugViewMode, setDebugViewMode] = useState('json');

  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
  };

  // Helper function to check if a field is required
  const isRequiredField = (key) => {
    const requiredFields = [
      'title',
      'product_group_id',
      'product_type_id',
      'region_id',
      'rating_group_id',
      'rating_id'
    ];
    return requiredFields.includes(key);
  };

  // Helper function to check if a field is empty
  const isEmptyField = (value) => {
    return value === undefined || value === null || value === '';
  };

  // Helper function to check if an attribute is required
  const isRequiredAttribute = (attributeId) => {
    if (!formData.filteredAttributes) return false;
    const attribute = formData.filteredAttributes.find(attr => attr.id === Number(attributeId));
    return attribute?.is_required === 1;
  };

  const renderTableView = (data, parentKey = '') => {
    return Object.entries(data).map(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return renderTableView(value, fullKey);
      }

      const isRequired = parentKey === 'attributes' 
        ? isRequiredAttribute(key)
        : isRequiredField(key);
      const isEmpty = isEmptyField(value);
      const isInvalid = isRequired && isEmpty;

      return (
        <tr key={fullKey} className={isInvalid ? 'invalid-field' : ''}>
          <td className="key-column">
            <div className="d-flex align-items-center justify-content-between">
              <span>{fullKey}</span>
              {isRequired && (
                <FaAsterisk className="required-icon" title="Required field" />
              )}
            </div>
          </td>
          <td className="value-column">
            {Array.isArray(value) ? JSON.stringify(value) : String(value || '')}
          </td>
        </tr>
      );
    });
  };

  const renderJsonContent = () => {
    const highlightJson = (obj) => {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          acc[key] = highlightJson(value);
        } else {
          const isRequired = key === 'attributes' 
            ? isRequiredAttribute(key)
            : isRequiredField(key);
          const isEmpty = isEmptyField(value);
          acc[key] = {
            value: value === undefined ? null : value,
            required: isRequired,
            invalid: isRequired && isEmpty
          };
        }
        return acc;
      }, {});
    };

    const highlightedData = highlightJson(formData);

    // Create a formatted string with highlighting
    const formatJsonWithHighlighting = (obj, level = 0) => {
      const indent = '  '.repeat(level);
      const lines = [];

      Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value) && !value.hasOwnProperty('value')) {
          // Handle nested objects
          lines.push(`${indent}"${key}": {`);
          lines.push(formatJsonWithHighlighting(value, level + 1));
          lines.push(`${indent}}`);
        } else if (value && typeof value === 'object' && value.hasOwnProperty('value')) {
          // Handle value objects with metadata
          const className = value.invalid ? 'invalid-field' : '';
          const displayValue = value.value === null ? 'null' : 
            typeof value.value === 'string' ? `"${value.value}"` : value.value;
          lines.push(`${indent}<span class="${className}">"${key}": ${displayValue}</span>`);
        }
      });

      return lines.join(',\n');
    };

    const formattedJson = `{\n${formatJsonWithHighlighting(highlightedData)}\n}`;

    return (
      <pre className="json-view" dangerouslySetInnerHTML={{ __html: formattedJson }} />
    );
  };

  // Process children to find and modify the Modal.Header
  const enhancedChildren = React.Children.map(children, child => {
    if (!child) return child;

    // If this is a Form component
    if (child.type?.displayName === 'Form' || 
        child.type?.name === 'Form' || 
        child.type === 'form') {
      
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, formChild => {
          if (!formChild) return formChild;

          // Check if this is BaseModalHeader
          const isBaseModalHeader = 
            formChild.type?.displayName === 'BaseModalHeader' ||
            formChild.type?.name === 'BaseModalHeader' ||
            (typeof formChild.type === 'function' && 
             (formChild.type.toString().includes('BaseModalHeader') || 
              formChild.type.name === 'BaseModalHeader'));

          if (isBaseModalHeader) {
            return React.cloneElement(formChild, {
              ...formChild.props,
              icon: null,
              showClose: false,
              className: `${formChild.props.className || ''} d-flex justify-content-between align-items-center`,
              children: (
                <>
                  <Modal.Title className="d-flex align-items-center gap-2">
                    {formChild.props.icon && (
                      <span className="modal-icon">{formChild.props.icon}</span>
                    )}
                    {formChild.props.children}
                  </Modal.Title>
                  <div className="d-flex align-items-center">
                    {debugFormData && (
                      <button
                        type="button"
                        className={`btn btn-icon btn-debug me-2 ${showDebugPanel ? 'active' : ''}`}
                        onClick={toggleDebugPanel}
                        title={showDebugPanel ? 'Hide Debug Panel' : 'Show Debug Panel'}
                      >
                        <FaBug />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={onHide}
                      aria-label="Close"
                    />
                  </div>
                </>
              )
            });
          }
          return formChild;
        })
      });
    }
    return child;
  });

  return (
    <>
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
        {enhancedChildren}
      </Modal>

      {debugFormData && showDebugPanel && (
        <div className="debug-panel">
          <div className="debug-panel-header">
            <h6 className="mb-0">Form Data Debug</h6>
            <div className="d-flex align-items-center">
              <div className="view-toggle me-2">
                <button
                  className={`btn btn-sm ${debugViewMode === 'json' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setDebugViewMode('json')}
                  title="JSON View"
                >
                  <FaCode />
                </button>
                <button
                  className={`btn btn-sm ms-1 ${debugViewMode === 'table' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setDebugViewMode('table')}
                  title="Table View"
                >
                  <FaTable />
                </button>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowDebugPanel(false)}
              />
            </div>
          </div>
          <div className="debug-panel-content">
            {debugViewMode === 'json' ? (
              renderJsonContent()
            ) : (
              <div className="table-view">
                <table>
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderTableView(formData)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
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
  children: PropTypes.node,
  debugFormData: PropTypes.bool,
  formData: PropTypes.object
};

export default BaseModal; 
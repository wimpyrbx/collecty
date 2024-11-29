import React from 'react';
import './AttributeDisplay.css';

const AttributeDisplay = ({ attribute, value }) => {
  // If attribute is not active, don't render anything
  if (!attribute?.is_active) {
    return null;
  }

  // Don't render if show_in_ui is false
  if (!attribute.show_in_ui) {
    return null;
  }

  // Handle empty values
  const isEmpty = !value || value === '0';
  
  // Don't show if empty and show_if_empty is false
  if (isEmpty && !attribute.show_if_empty) {
    return null;
  }

  if (attribute.use_image) {
    const imagePath = `assets/images/attributes/${attribute.name.toLowerCase()}.webp`;
    return (
      <img
        src={imagePath}
        alt={attribute.ui_name}
        title={attribute.ui_name}
        className={`attribute-image ${isEmpty ? 'attribute-image-empty' : ''}`}
      />
    );
  }

  // Text display - only show if not using image
  if (attribute.type === 'boolean') {
    const boolValue = value === '1';
    return (
      <div className="attribute-text" title={attribute.description || ''}>
        {attribute.ui_name}: <strong className={boolValue ? 'text-success' : 'text-danger'}>
          {boolValue ? 'Yes' : 'No'}
        </strong>
      </div>
    );
  }

  return isEmpty ? '' : (
    <div className="attribute-text" title={attribute.description || ''}>
      {attribute.ui_name}: <strong>{value}</strong>
    </div>
  );
};

export default AttributeDisplay; 
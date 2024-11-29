import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductAttributeBox from './ProductAttributeBox';
import './AttributesSection.css';

const AttributesSection = ({ 
  show, 
  attributes, 
  attributeValues, 
  handleAttributeChange, 
  touched 
}) => {
  // Don't render anything if no attributes
  if (!attributes || !attributes.length) {
    console.log('No attributes available, not rendering section');
    return null;
  }

  console.log('AttributesSection render:', {
    show,
    attributesCount: attributes.length,
    hasValues: Object.keys(attributeValues || {}).length > 0,
    className: `attributes-section ${show ? 'show' : ''}`
  });

  return (
    <div className={`attributes-section ${show ? 'show' : ''}`} style={{display: show ? 'block' : 'none'}}>
      <div className="card mb-3 attribute-card">
        <div className="card-header">
          <h5>Product Attributes</h5>
        </div>
        <div className="card-body">
          <Row>
            {attributes.map(attribute => {
              // Ensure we have valid arrays
              const groupIds = Array.isArray(attribute.product_group_ids) 
                ? attribute.product_group_ids 
                : JSON.parse(attribute.product_group_ids || '[]');
              
              const typeIds = Array.isArray(attribute.product_type_ids)
                ? attribute.product_type_ids
                : JSON.parse(attribute.product_type_ids || '[]');

              console.log('Attribute arrays:', {
                name: attribute.name,
                groupIds,
                typeIds
              });

              return (
                <Col md={3} key={attribute.id} className="mb-3">
                  <ProductAttributeBox
                    attribute={{
                      ...attribute,
                      product_group_ids: groupIds,
                      product_type_ids: typeIds
                    }}
                    value={attributeValues[attribute.id]}
                    onChange={handleAttributeChange}
                    touched={touched}
                    isInvalid={attribute.is_required && !attributeValues[attribute.id]}
                  />
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AttributesSection; 
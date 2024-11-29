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

  return (
    <div className={`attributes-section ${show ? 'show' : ''}`}>
      <div className="card attribute-card">
        <div className="section-title">
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

              return (
                <Col md={3} key={attribute.id}>
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
                    data-attribute-id={attribute.id}
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
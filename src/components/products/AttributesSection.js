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
  return (
    <div className={`attributes-section ${show ? 'show' : ''}`}>
      <div className="card mb-3 attribute-card">
        <div className="card-header">
          <h5>Product Attributes</h5>
        </div>
        <div className="card-body">
          <Row>
            {attributes.map(attribute => (
              <Col md={3} key={attribute.id} className="mb-3">
                <ProductAttributeBox
                  attribute={attribute}
                  value={attributeValues[attribute.id]}
                  onChange={handleAttributeChange}
                  touched={touched}
                  isInvalid={attribute.is_required && !attributeValues[attribute.id]}
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AttributesSection; 
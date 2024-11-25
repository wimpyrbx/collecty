import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import ChainedSelect from '../common/ChainedSelect';

const ProductBasicInfo = ({ 
  formData, 
  onChange, 
  productGroups, 
  productTypes,
  hasSubmitted = false,
  nameInputRef = null
}) => {
  return (
    <Row className="mb-3">
      <Col md={4}>
        <Form.Group>
          <Form.Label>Name *</Form.Label>
          <Form.Control
            ref={nameInputRef}
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            isInvalid={hasSubmitted && !formData.title}
          />
          {hasSubmitted && !formData.title && (
            <Form.Control.Feedback type="invalid">
              * Required
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Col>
      <Col md={4}>
        <ChainedSelect
          name="product_group_id"
          value={formData.product_group_id}
          onChange={onChange}
          options={productGroups}
          label="Product Group"
          isRequired
          isInvalid={hasSubmitted && !formData.product_group_id}
        />
      </Col>
      <Col md={4}>
        <ChainedSelect
          name="product_type_id"
          value={formData.product_type_id}
          onChange={onChange}
          options={productTypes}
          label="Product Type"
          isRequired
          isInvalid={hasSubmitted && !formData.product_type_id}
        />
      </Col>
    </Row>
  );
};

export default ProductBasicInfo; 
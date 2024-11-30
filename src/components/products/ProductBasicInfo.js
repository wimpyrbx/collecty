import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import ChainedSelect from '../common/ChainedSelect';
import ProductImagePreview from './ProductImagePreview';
import AttributesSection from './AttributesSection';
import './ProductBasicInfo.css';

const ProductBasicInfo = ({
  formData, 
  onChange, 
  productGroups, 
  productTypes,
  regions,
  availableRatingGroups,
  availableRatings,
  attributes,
  attributeValues,
  handleAttributeChange,
  hasSubmitted = false,
  nameInputRef = null
}) => {
  return (
    <Row>
      {/* Left Column - Image Section */}
      <Col md={3}>
        <div className="image-section">
          <div className="image-container">
            <ProductImagePreview imageSrc={formData.product_image} size="large" />
          </div>
        </div>
      </Col>

      {/* Right Column - Form Fields */}
      <Col md={9}>
        <Row style={{ marginBottom: '-37px' }}>
          <Col md={9}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                ref={nameInputRef}
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={onChange}
                isInvalid={hasSubmitted && !formData.title}
              />
              <Form.Control.Feedback type="invalid">
                * Required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Release Year</Form.Label>
              <Form.Control
                type="number"
                name="release_year"
                value={formData.release_year || ''}
                onChange={onChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3 row-no-border">
          <Col md={6}>
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
          <Col md={6}>
            <ChainedSelect
              name="product_type_id"
              value={formData.product_type_id}
              onChange={onChange}
              options={productTypes}
              label="Product Type"
              disabled={!formData.product_group_id}
              isRequired
              isInvalid={hasSubmitted && !formData.product_type_id}
            />
          </Col>
        </Row>

        {/* Attributes Section */}
        <AttributesSection 
          show={!!(formData.product_group_id && formData.product_type_id && attributes?.length > 0)}
          attributes={attributes || []}
          attributeValues={attributeValues}
          handleAttributeChange={handleAttributeChange}
          hasSubmitted={hasSubmitted}
        />

        <Row className="row-no-border">
          <Col md={4}>
            <ChainedSelect
              name="region_id"
              value={formData.region_id}
              onChange={onChange}
              options={regions}
              label="Region"
              isRequired
              isInvalid={hasSubmitted && !formData.region_id}
            />
          </Col>
          <Col md={4}>
            <ChainedSelect
              name="rating_group_id"
              value={formData.rating_group_id}
              onChange={onChange}
              options={availableRatingGroups}
              label="Rating Group"
              disabled={!formData.region_id}
            />
          </Col>
          <Col md={4}>
            <ChainedSelect
              name="rating_id"
              value={formData.rating_id}
              onChange={onChange}
              options={availableRatings}
              label="Rating"
              disabled={!formData.rating_group_id}
            />
          </Col>
        </Row>

        <Row className="row-no-spacing" style={{ marginTop: '-10px' }}>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="description"
                value={formData.description || ''}
                onChange={onChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ProductBasicInfo; 
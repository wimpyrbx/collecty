import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

const ProductAdditionalInfo = ({ formData, onChange }) => {
  return (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Product Image URL</Form.Label>
            <Form.Control
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={onChange}
              placeholder="https://"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Release Year</Form.Label>
            <Form.Control
              type="number"
              name="release_year"
              value={formData.release_year}
              onChange={onChange}
              min="1950"
              max="2050"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={onChange}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default ProductAdditionalInfo; 
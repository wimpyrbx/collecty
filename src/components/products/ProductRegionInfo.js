import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ChainedSelect from '../common/ChainedSelect';

const ProductRegionInfo = ({
  formData,
  onChange,
  regions,
  availableRatingGroups,
  availableRatings,
  hasSubmitted = false
}) => {
  return (
    <Row className="mb-3">
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
  );
};

export default ProductRegionInfo; 
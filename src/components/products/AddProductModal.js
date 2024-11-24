import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './AddProductModal.css';

const AddProductModal = ({ show, onHide, onProductAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    product_group_id: '',
    product_type_id: '',
    region_id: '',
    rating_id: '',
    rating_group_id: '',
    image_url: '',
    developer: '',
    publisher: '',
    release_year: '',
    genre: '',
    description: '',
    is_active: true
  });

  const [attributes, setAttributes] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingGroups, setRatingGroups] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attributeValues, setAttributeValues] = useState({});
  const [touched, setTouched] = useState(false);
  const [availableRatingGroups, setAvailableRatingGroups] = useState([]);

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [groupsRes, typesRes, regionsRes, ratingsRes, ratingGroupsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/product-groups'),
          axios.get('http://localhost:5000/api/product-types'),
          axios.get('http://localhost:5000/api/regions'),
          axios.get('http://localhost:5000/api/ratings'),
          axios.get('http://localhost:5000/api/rating-groups')
        ]);

        setProductGroups(groupsRes.data.data);
        setProductTypes(typesRes.data.data);
        setRegions(regionsRes.data.data);
        setRatings(ratingsRes.data.data);
        setRatingGroups(ratingGroupsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch reference data:', err);
        setError('Failed to load reference data');
      }
    };

    if (show) {
      fetchReferenceData();
      // Reset form data when modal opens
      setFormData({
        title: '',
        product_group_id: '',
        product_type_id: '',
        region_id: '',
        rating_id: '',
        rating_group_id: '',
        image_url: '',
        developer: '',
        publisher: '',
        release_year: '',
        genre: '',
        description: '',
        is_active: true
      });
      setAttributeValues({});
      setAttributes([]);
    }
  }, [show]);

  // Update the attributes fetch effect
  useEffect(() => {
    const fetchAttributes = async () => {
      // Only fetch attributes if both group and type are selected
      if (!formData.product_group_id || !formData.product_type_id) {
        setAttributes([]);
        // Clear all attribute values when removing attributes
        setAttributeValues({});
        return;
      }

      try {
        const params = {
          scope: 'product',
          productGroupId: formData.product_group_id,
          productTypeId: formData.product_type_id,
          sortOrder: 'asc'
        };

        const response = await axios.get('http://localhost:5000/api/attributes', { params });

        // Filter attributes based on the complex logic
        const filteredAttributes = response.data.data.filter(attr => {
          const groupIds = JSON.parse(attr.product_group_ids || '[]');
          const typeIds = JSON.parse(attr.product_type_ids || '[]');

          // Case 1: No limits on either group or type
          if (groupIds.length === 0 && typeIds.length === 0) {
            return true;
          }

          // Case 2: Group match (or no group limit) AND Type match (or no type limit)
          const groupMatch = groupIds.length === 0 || groupIds.includes(Number(formData.product_group_id));
          const typeMatch = typeIds.length === 0 || typeIds.includes(Number(formData.product_type_id));

          return groupMatch && typeMatch;
        });

        setAttributes(filteredAttributes);

        // Clean up attribute values - remove any that aren't in the new attribute list
        setAttributeValues(prev => {
          const newValues = {};
          const validAttributeIds = filteredAttributes.map(attr => attr.id);
          
          // Only keep values for attributes that still exist
          Object.entries(prev).forEach(([attrId, value]) => {
            if (validAttributeIds.includes(Number(attrId))) {
              newValues[attrId] = value;
            }
          });

          // Set defaults for new attributes only
          filteredAttributes.forEach(attr => {
            if (!newValues.hasOwnProperty(attr.id) && attr.default_value) {
              newValues[attr.id] = attr.default_value;
            }
          });

          return newValues;
        });

      } catch (err) {
        console.error('Failed to fetch attributes:', err);
        toast.error('Failed to load product attributes');
      }
    };

    fetchAttributes();
  }, [formData.product_group_id, formData.product_type_id]);

  // Update available ratings when rating group changes
  useEffect(() => {
    if (!formData.rating_group_id) {
      setAvailableRatings([]);
      return;
    }

    const filteredRatings = ratings.filter(
      rating => rating.rating_group_id === Number(formData.rating_group_id)
    );
    setAvailableRatings(filteredRatings);
  }, [formData.rating_group_id, ratings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'region_id') {
      // Filter rating groups for selected region
      const regionRatingGroups = ratingGroups.filter(
        group => group.region_id === Number(value)
      );
      setAvailableRatingGroups(regionRatingGroups);

      // Auto-select rating group if only one exists
      const newRatingGroupId = regionRatingGroups.length === 1 ? 
        String(regionRatingGroups[0].id) : '';

      setFormData(prev => ({
        ...prev,
        region_id: value,
        rating_group_id: newRatingGroupId,
        rating_id: ''
      }));

      // If we auto-selected a rating group, trigger the ratings update
      if (newRatingGroupId) {
        const filteredRatings = ratings.filter(
          rating => rating.rating_group_id === Number(newRatingGroupId)
        );
        setAvailableRatings(filteredRatings);
      }
    } else if (name === 'rating_group_id') {
      setFormData(prev => ({
        ...prev,
        rating_group_id: value,
        rating_id: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAttributeChange = (attributeId, value) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  // Update validateForm to only check required fields
  const validateForm = () => {
    const errors = [];

    // Required fields validation
    if (!formData.title) errors.push('Title is required');
    if (!formData.product_group_id) errors.push('Product Group is required');
    if (!formData.product_type_id) errors.push('Product Type is required');
    if (!formData.region_id) errors.push('Region is required');

    // Image URL validation - only if URL is provided
    if (formData.image_url && !formData.image_url.match(/^https?:\/\/.+/)) {
      errors.push('Invalid image URL format');
    }

    // Release year validation - only if year is provided
    if (formData.release_year) {
      const year = Number(formData.release_year);
      if (isNaN(year) || year < 1950 || year > 2050) {
        errors.push('Release year must be between 1950 and 2050');
      }
    }

    // Rating validation - only if rating group is selected
    if (formData.rating_group_id && !formData.rating_id) {
      errors.push('Please select a rating for the chosen rating group');
    }

    // Required attributes validation - only check attributes marked as required
    const missingRequiredAttributes = attributes
      .filter(attr => attr.is_required && !attributeValues[attr.id])
      .map(attr => attr.ui_name);

    if (missingRequiredAttributes.length > 0) {
      errors.push(`Missing required attributes: ${missingRequiredAttributes.join(', ')}`);
    }

    return errors.length > 0 ? errors.join('\n') : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    // Validate required fields
    if (!formData.title || !formData.product_group_id || !formData.product_type_id || !formData.region_id) {
      console.log('Missing required fields:', {
        title: formData.title,
        product_group_id: formData.product_group_id,
        product_type_id: formData.product_type_id,
        region_id: formData.region_id
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert string IDs to numbers and create payload
      const payload = {
        ...formData,
        product_group_id: parseInt(formData.product_group_id, 10),
        product_type_id: parseInt(formData.product_type_id, 10),
        region_id: parseInt(formData.region_id, 10),
        rating_id: formData.rating_id ? parseInt(formData.rating_id, 10) : null,
        rating_group_id: formData.rating_group_id ? parseInt(formData.rating_group_id, 10) : null,
        release_year: formData.release_year ? parseInt(formData.release_year, 10) : null
      };

      console.log('Sending payload:', payload); // Debug log

      // Create product
      const response = await axios.post('http://localhost:5000/api/products', payload);
      const productId = response.data.data.id;

      // Create attribute values if any
      if (Object.keys(attributeValues).length > 0) {
        const attributePromises = Object.entries(attributeValues).map(([attributeId, value]) => {
          return axios.post('http://localhost:5000/api/product-attribute-values', {
            product_id: productId,
            attribute_id: parseInt(attributeId, 10),
            value: value.toString()
          });
        });

        await Promise.all(attributePromises);
      }

      toast.success('Product created successfully');
      onProductAdded();
      onHide();
    } catch (err) {
      console.error('Failed to create product:', err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to create product');
      toast.error(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const renderAttributeInput = (attribute) => {
    switch (attribute.type) {
      case 'boolean':
        return (
          <Form.Check
            type="switch"
            id={`switch-${attribute.id}`}
            checked={attributeValues[attribute.id] === '1'}
            onChange={(e) => handleAttributeChange(attribute.id, e.target.checked ? '1' : '0')}
            label={attributeValues[attribute.id] === '1' ? 'Yes' : 'No'}
          />
        );
      
      case 'set':
        const allowedValues = JSON.parse(attribute.allowed_values || '[]');
        return (
          <Form.Select
            value={attributeValues[attribute.id] || ''}
            onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
          >
            <option value="">Select {attribute.ui_name}</option>
            {allowedValues.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Form.Select>
        );

      case 'number':
        return (
          <Form.Control
            type="number"
            value={attributeValues[attribute.id] || ''}
            onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
          />
        );

      default: // string
        return (
          <Form.Control
            type="text"
            value={attributeValues[attribute.id] || ''}
            onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
          />
        );
    }
  };

  // Update the form JSX to group region and rating fields
  const renderRegionAndRatingFields = () => (
    <Row className="mb-3">
      <Col md={4}>
        <Form.Group>
          <Form.Label>Region *</Form.Label>
          <Form.Select
            name="region_id"
            value={formData.region_id}
            onChange={handleInputChange}
            isInvalid={touched && !formData.region_id}
          >
            <option value="">Select Region</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            Please select a region
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group>
          <Form.Label>Rating Group</Form.Label>
          <Form.Select
            name="rating_group_id"
            value={formData.rating_group_id}
            onChange={handleInputChange}
            disabled={!formData.region_id}
          >
            <option value="">Select Rating Group</option>
            {availableRatingGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group>
          <Form.Label>Rating</Form.Label>
          <Form.Select
            name="rating_id"
            value={formData.rating_id}
            onChange={handleInputChange}
            disabled={!formData.rating_group_id}
          >
            <option value="">Select Rating</option>
            {availableRatings.map(rating => (
              <option key={rating.id} value={rating.id}>{rating.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" className="product-modal">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Add New Product</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="bg-light">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  isInvalid={touched && !formData.title}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a title
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product Group *</Form.Label>
                <Form.Select
                  name="product_group_id"
                  value={formData.product_group_id}
                  onChange={handleInputChange}
                  isInvalid={touched && !formData.product_group_id}
                >
                  <option value="">Select Product Group</option>
                  {productGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a product group
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product Type *</Form.Label>
                <Form.Select
                  name="product_type_id"
                  value={formData.product_type_id}
                  onChange={handleInputChange}
                  isInvalid={touched && !formData.product_type_id}
                >
                  <option value="">Select Product Type</option>
                  {productTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a product type
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {renderRegionAndRatingFields()}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Developer</Form.Label>
                <Form.Control
                  type="text"
                  name="developer"
                  value={formData.developer}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Publisher</Form.Label>
                <Form.Control
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Release Year</Form.Label>
                <Form.Control
                  type="number"
                  name="release_year"
                  value={formData.release_year}
                  onChange={handleInputChange}
                  min="1950"
                  max="2050"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Genre</Form.Label>
                <Form.Control
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </Form.Group>

          {formData.product_group_id && formData.product_type_id && attributes.length > 0 && (
            <>
              <h5 className="mt-4">Product Attributes</h5>
              <Row>
                {attributes.map(attribute => (
                  <Col md={6} key={attribute.id} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        {attribute.ui_name}
                        {attribute.is_required && ' *'}
                      </Form.Label>
                      {renderAttributeInput(attribute)}
                      {touched && attribute.is_required && !attributeValues[attribute.id] && (
                        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                          This field is required
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProductModal; 
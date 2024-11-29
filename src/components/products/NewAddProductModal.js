import React, { useRef, useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../BaseModal';
import ProductBasicInfo from './ProductBasicInfo';
import ProductAdditionalInfo from './ProductAdditionalInfo';
import AttributesSection from './AttributesSection';
import './NewAddProductModal.css';
import ChainedSelect from '../common/ChainedSelect';
import axios from 'axios';

const NewAddProductModal = ({ 
  show, 
  onHide, 
  onProductAdded, 
  initialData = null,
  productGroups = [],
  productTypes = [],
  regions = [],
  availableRatingGroups = [],
  availableRatings = [],
  attributes = [],
  attributeValues = {},
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [warning, setWarning] = useState('');
  const nameInputRef = useRef(null);
  const ratingGroupSelectRef = useRef(null);
  const ratingSelectRef = useRef(null);
  const [filteredAttributes, setFilteredAttributes] = useState([]);

  useEffect(() => {
    if (show) {
      //console.group('Modal Data');
      //console.log('Product Groups:', productGroups);
      //console.log('Product Types:', productTypes);
      //console.log('Regions:', regions);
      //console.log('Rating Groups:', availableRatingGroups);
      //console.log('Ratings:', availableRatings);
      //console.log('Attributes:', attributes);
      //console.log('Attribute Values:', attributeValues);
      //console.groupEnd();
    }
  }, [show, productGroups, productTypes, regions, availableRatingGroups, availableRatings, attributes, attributeValues]);

  useEffect(() => {
    const fetchAttributes = async () => {
      if (!formData.product_group_id || !formData.product_type_id) {
        //console.log('Skipping attribute fetch - need both product group and type selected');
        setFilteredAttributes([]);
        setFormData(prev => ({
          ...prev,
          attributes: {}
        }));
        return;
      }

      //console.log('Fetching attributes with current values:', {
      //  productGroupId: formData.product_group_id,
      //  productTypeId: formData.product_type_id
      //});

      try {
        const response = await axios.get('http://localhost:5000/api/attributes', {
          params: { 
            scope: 'product',
            productGroupId: formData.product_group_id,
            productTypeId: formData.product_type_id,
            sortOrder: 'asc'
          }
        });

        //console.log('Fetched attributes:', response.data.data);
        
        const filteredAttrs = (response.data.data || []).filter(attr => {
          const matchesGroup = !attr.product_group_ids || 
            attr.product_group_ids.length === 0 || 
            attr.product_group_ids.includes(Number(formData.product_group_id));

          const matchesType = !attr.product_type_ids || 
            attr.product_type_ids.length === 0 || 
            attr.product_type_ids.includes(Number(formData.product_type_id));

          return matchesGroup && matchesType;
        });

        //console.log('Filtered attributes:', filteredAttrs);
        setFilteredAttributes(filteredAttrs);

        const newAttributeValues = {};
        filteredAttrs.forEach(attr => {
          if (attr.default_value) {
            newAttributeValues[attr.id] = attr.default_value;
          }
        });
        
        setFormData(prev => ({
          ...prev,
          attributes: {
            ...prev.attributes,
            ...newAttributeValues
          }
        }));

      } catch (err) {
        console.error('Failed to fetch attributes:', err);
        setFilteredAttributes([]);
      }
    };

    fetchAttributes();
  }, [formData.product_group_id, formData.product_type_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttributeChange = (attributeId, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    setLoading(true);
    
    try {
      if (onProductAdded) {
        await onProductAdded(formData);
      }
      onHide();
    } catch (error) {
      setWarning(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductGroupChange = (e) => {
    const groupId = e.target.value;
    setFormData(prev => ({
      ...prev,
      product_group_id: groupId,
      attributes: {}
    }));
  };

  const handleProductTypeChange = (e) => {
    const typeId = e.target.value;
    setFormData(prev => ({
      ...prev,
      product_type_id: typeId,
      attributes: {}
    }));
  };

  const handleRegionChange = (e) => {
    const regionId = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      region_id: regionId,
      rating_group_id: '',
      rating_id: ''
    }));

    if (regionId) {
      const groupsForRegion = availableRatingGroups.filter(g => g.region_id === regionId);
      
      if (groupsForRegion.length === 1) {
        handleRatingGroupChange({ target: { value: groupsForRegion[0].id } });
      } else { 
        setTimeout(() => {
          if (ratingGroupSelectRef.current) {
            ratingGroupSelectRef.current.focus();
          }
        }, 0);
      }
    }
  };

  const handleRatingGroupChange = (e) => {
    const groupId = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      rating_group_id: groupId,
      rating_id: ''
    }));

    if (groupId) {
      const ratingsForGroup = availableRatings.filter(r => r.rating_group_id === groupId);
      
      if (ratingsForGroup.length === 1) {
        handleInputChange({ target: { name: 'rating_id', value: ratingsForGroup[0].id } });
        setTimeout(() => {
          if (ratingSelectRef.current) {
            ratingSelectRef.current.focus();
          }
        }, 0);
      } else {
        setTimeout(() => {
          if (ratingSelectRef.current) {
            ratingSelectRef.current.focus();
          }
        }, 0);
      }
    }
  };

  const filteredRatingGroups = availableRatingGroups.filter(group => 
    group.region_id === formData.region_id
  );

  const filteredRatings = availableRatings.filter(rating => 
    rating.rating_group_id === formData.rating_group_id
  );

  return (
    <BaseModal 
      show={show} 
      onHide={onHide}
      size="lg"
      className="new-product-modal"
    >
      <Form onSubmit={handleSubmit}>
        <BaseModalHeader 
          icon={<FaPlus />}
          onHide={onHide}
        >
          {initialData ? 'Edit' : 'Add New'} Product
          {warning && (
            <div className="modal-warning">
              {warning}
            </div>
          )}
        </BaseModalHeader>

        <BaseModalBody>
          <Row>
            <Col md={4}>
              <div className="image-section mb-3">
                <h6 className="section-title">Product Image</h6>
                <div className="image-placeholder">
                  <Form.Control
                    type="text"
                    name="image_url"
                    placeholder="Enter image URL"
                    value={formData.image_url || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </Col>
            <Col md={8}>
              <div className="basic-info-section mb-3">
                <h6 className="section-title">Basic Information</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        required
                        ref={nameInputRef}
                        value={formData.title || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Group *</Form.Label>
                      <Form.Select
                        name="product_group_id"
                        required
                        value={formData.product_group_id || ''}
                        onChange={handleProductGroupChange}
                      >
                        <option value="">Select Group</option>
                        {productGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Type *</Form.Label>
                      <Form.Select
                        name="product_type_id"
                        required
                        value={formData.product_type_id || ''}
                        onChange={handleProductTypeChange}
                      >
                        <option value="">Select Type</option>
                        {productTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Release Year</Form.Label>
                      <Form.Control
                        type="number"
                        name="release_year"
                        value={formData.release_year || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <ChainedSelect
                      name="region_id"
                      label="Region"
                      value={formData.region_id || ''}
                      onChange={handleRegionChange}
                      options={regions}
                      isRequired={true}
                      isInvalid={hasSubmitted && !formData.region_id}
                    />
                  </Col>
                  <Col md={3}>
                    <ChainedSelect
                      name="rating_group_id"
                      label="Rating Group"
                      value={formData.rating_group_id || ''}
                      onChange={handleRatingGroupChange}
                      options={filteredRatingGroups}
                      disabled={!formData.region_id}
                      isInvalid={hasSubmitted && !formData.rating_group_id}
                      ref={ratingGroupSelectRef}
                    />
                  </Col>
                  <Col md={3}>
                    <ChainedSelect
                      name="rating_id"
                      label="Rating"
                      value={formData.rating_id || ''}
                      onChange={handleInputChange}
                      options={filteredRatings}
                      disabled={!formData.rating_group_id}
                      isInvalid={hasSubmitted && !formData.rating_id}
                      ref={ratingSelectRef}
                    />
                  </Col>
                </Row>
              </div>

              <AttributesSection 
                show={filteredAttributes.length > 0}
                attributes={filteredAttributes}
                attributeValues={formData.attributes || {}}
                handleAttributeChange={handleAttributeChange}
                touched={hasSubmitted}
              />
            </Col>
          </Row>
        </BaseModalBody>

        <BaseModalFooter
          onCancel={onHide}
          onConfirm={handleSubmit}
          cancelText="Cancel"
          confirmText={loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update' : 'Create')}
          isLoading={loading}
        />
      </Form>
    </BaseModal>
  );
};

export default NewAddProductModal; 
import React, { useRef, useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../BaseModal';
import ProductBasicInfo from './ProductBasicInfo';
import ProductAdditionalInfo from './ProductAdditionalInfo';
import ProductAttributeBox from './ProductAttributeBox';
import './NewAddProductModal.css';
import ChainedSelect from '../common/ChainedSelect';
import axios from 'axios';

const initialFormState = {
  title: '',
  product_group_id: '',
  product_type_id: '',
  region_id: '',
  rating_id: '',
  rating_group_id: '',
  image_url: '',
  release_year: '',
  description: '',
  is_active: true,
  attributes: {}
};

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
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [warning, setWarning] = useState('');
  const nameInputRef = useRef(null);
  const ratingGroupSelectRef = useRef(null);
  const ratingSelectRef = useRef(null);
  const [filteredAttributes, setFilteredAttributes] = useState([]);

  useEffect(() => {
    if (show) {
      // Reset form state when modal opens
      setFormData(initialFormState);
      setFilteredAttributes([]);
      setHasSubmitted(false);
      
      // Focus the name input after a short delay
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [show]);

  useEffect(() => {
    const fetchAttributes = async () => {
      if (!formData.product_group_id || !formData.product_type_id) {
        setFilteredAttributes([]);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/attributes', {
          params: { 
            scope: 'product',
            is_active: true
          }
        });
        
        const filteredAttrs = (response.data.data || []).filter(attr => {
          const groupIds = JSON.parse(attr.product_group_ids || '[]');
          const typeIds = JSON.parse(attr.product_type_ids || '[]');

          const matchesGroup = groupIds.length === 0 || 
            groupIds.includes(Number(formData.product_group_id));

          const matchesType = typeIds.length === 0 || 
            typeIds.includes(Number(formData.product_type_id));

          return matchesGroup && matchesType && attr.is_active === 1;
        });

        setFilteredAttributes(filteredAttrs);

        // Clean up any attributes that are no longer valid
        const validAttributeIds = filteredAttrs.map(attr => attr.id);
        setFormData(prev => ({
          ...prev,
          attributes: Object.fromEntries(
            Object.entries(prev.attributes).filter(([key]) => 
              validAttributeIds.includes(Number(key))
            )
          )
        }));

      } catch (err) {
        console.error('Failed to fetch attributes:', err);
        setFilteredAttributes([]);
      }
    };

    fetchAttributes();
  }, [formData.product_group_id, formData.product_type_id]);

  useEffect(() => {
    //console.group('Product Group/Type Change');
    //console.log('Selected Group:', formData.product_group_id);
    //console.log('Selected Type:', formData.product_type_id);
    //console.log('Available Attributes:', attributes);
    //console.log('Filtered Attributes:', attributes.filter(attr => {
      //const groupIds = attr.product_group_ids ? JSON.parse(attr.product_group_ids) : [];
      //const typeIds = attr.product_type_ids ? JSON.parse(attr.product_type_ids) : [];
      //const matchesGroup = !groupIds.length || groupIds.includes(formData.product_group_id);
      //const matchesType = !typeIds.length || typeIds.includes(formData.product_type_id);
      //return attr.is_active && matchesGroup && matchesType;
    //}));
    //console.groupEnd();
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
    
    // Keep only the attributes that are still valid for the new group
    const validAttributeIds = filteredAttributes
      .filter(attr => {
        const groupIds = Array.isArray(attr.product_group_ids) 
          ? attr.product_group_ids 
          : JSON.parse(attr.product_group_ids || '[]');
        return groupIds.length === 0 || groupIds.includes(Number(groupId));
      })
      .map(attr => attr.id);

    setFormData(prev => ({
      ...prev,
      product_group_id: groupId,
      attributes: Object.fromEntries(
        Object.entries(prev.attributes).filter(([key]) => 
          validAttributeIds.includes(Number(key))
        )
      )
    }));
  };

  const handleProductTypeChange = (e) => {
    const typeId = e.target.value;
    
    // Keep only the attributes that are still valid for the new type
    const validAttributeIds = filteredAttributes
      .filter(attr => {
        const typeIds = Array.isArray(attr.product_type_ids) 
          ? attr.product_type_ids 
          : JSON.parse(attr.product_type_ids || '[]');
        return typeIds.length === 0 || typeIds.includes(Number(typeId));
      })
      .map(attr => attr.id);

    setFormData(prev => ({
      ...prev,
      product_type_id: typeId,
      attributes: Object.fromEntries(
        Object.entries(prev.attributes).filter(([key]) => 
          validAttributeIds.includes(Number(key))
        )
      )
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

  const hasActiveAttributes = filteredAttributes.length > 0;
  //console.log('Before render:', {
    //hasActiveAttributes,
    //filteredAttributesLength: filteredAttributes.length,
    //attributeValues: formData.attributes,
  //});

  return (
    <BaseModal 
      show={show} 
      onHide={onHide}
      size="lg"
      className="new-product-modal"
      debugFormData={true}
      formData={{
        ...formData,
        filteredAttributes,
        hasActiveAttributes,
        availableRatingGroups: filteredRatingGroups,
        availableRatings: filteredRatings
      }}
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

              {hasActiveAttributes && (
                <div className={`attributes-section ${hasActiveAttributes ? 'show' : ''}`}>
                  <div className="section-title mb-0">
                    <h5>Product Attributes</h5>
                  </div>
                  <div className="attribute-card">
                    <Row>
                      {filteredAttributes.map(attribute => {
                        // Ensure we have valid arrays
                        const groupIds = Array.isArray(attribute.product_group_ids) 
                          ? attribute.product_group_ids 
                          : JSON.parse(attribute.product_group_ids || '[]');
                        
                        const typeIds = Array.isArray(attribute.product_type_ids)
                          ? attribute.product_type_ids
                          : JSON.parse(attribute.product_type_ids || '[]');

                        return (
                          <Col md={4} key={attribute.id} className="mb-3">
                            <ProductAttributeBox
                              attribute={{
                                ...attribute,
                                product_group_ids: groupIds,
                                product_type_ids: typeIds
                              }}
                              value={formData.attributes[attribute.id]}
                              onChange={handleAttributeChange}
                              touched={hasSubmitted}
                              isInvalid={attribute.is_required && !formData.attributes[attribute.id]}
                            />
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                </div>
              )}
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
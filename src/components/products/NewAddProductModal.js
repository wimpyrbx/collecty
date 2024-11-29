import React, { useRef, useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaPlus, FaImage, FaUpload } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../BaseModal';
import ProductBasicInfo from './ProductBasicInfo';
import ProductAdditionalInfo from './ProductAdditionalInfo';
import ProductAttributeBox from './ProductAttributeBox';
import './NewAddProductModal.css';
import ChainedSelect from '../common/ChainedSelect';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const [formRef] = useState(React.createRef());

  useEffect(() => {
    if (show) {
      // Reset form when modal opens
      const initialValues = {
        ...initialFormState,
        // Use preselected values from initialData if available
        product_group_id: initialData?.product_group_id || '',
        product_type_id: initialData?.product_type_id || '',
        region_id: initialData?.region_id || '',
        attributes: {}
      };
      setFormData(initialValues);
      setPreviewUrl('');
      setHasSubmitted(false);
      setDragActive(false);
      setFilteredAttributes([]);

      // Focus the name input after a short delay
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);

      // If region is preselected, trigger the change
      if (initialData?.region_id) {
        handleRegionChange({ target: { value: initialData.region_id } });
      }
    }
  }, [show, initialData]);

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

  // Add validation function
  const validateForm = () => {
    const errors = [];
    const invalidFields = {
      required_fields: {},
      required_attributes: {}
    };
    
    // Required fields validation in order of appearance
    const validationFields = [
      { field: 'title', ref: nameInputRef, message: "Product Name is required" },
      { field: 'product_group_id', message: "Product Group is required" },
      { field: 'product_type_id', message: "Product Type is required" },
      { field: 'region_id', message: "Region is required" }
    ];

    let firstInvalidElement = null;

    // Check each field in order
    validationFields.forEach(({ field, ref, message }) => {
      if (!formData[field]) {
        errors.push(message);
        invalidFields.required_fields[field] = formData[field];

        // Store the first invalid element we find
        if (!firstInvalidElement) {
          if (ref) {
            firstInvalidElement = ref.current;
          } else {
            // For select elements without refs, find them in the DOM
            const element = document.querySelector(`[name="${field}"]`);
            if (element) firstInvalidElement = element;
          }
        }
      }
    });

    // Validate required attributes
    filteredAttributes.forEach(attr => {
      if (attr.is_required) {
        const value = formData.attributes[attr.id];
        const isEmpty = attr.type === 'boolean' ? 
          value === undefined || value === null : // for boolean, only undefined/null is invalid
          !value; // for other types, empty string or falsy value is invalid

        // Convert boolean values to 0/1 for consistency
        const displayValue = attr.type === 'boolean' ? 
          (value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0) :
          value;

        if (isEmpty) {
          errors.push(`${attr.ui_name || attr.name} is required`);
          invalidFields.required_attributes[attr.id] = {
            name: attr.ui_name || attr.name,
            value: displayValue,
            type: attr.type
          };

          // If no previous invalid element was found, find the attribute input
          if (!firstInvalidElement) {
            const element = document.querySelector(`[data-attribute-id="${attr.id}"]`);
            if (element) firstInvalidElement = element;
          }
        }
      }
    });

    if (errors.length > 0) {
      console.log('Validation failed. Missing or invalid fields:', invalidFields);
      
      // Focus the first invalid element
      if (firstInvalidElement) {
        setTimeout(() => {
          firstInvalidElement.focus();
        }, 100);
      }
      
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Log validation state for all fields
    const validationState = {
      required_fields: {
        title: {
          value: formData.title,
          valid: Boolean(formData.title?.trim())
        },
        product_group_id: {
          value: formData.product_group_id,
          valid: Boolean(formData.product_group_id)
        },
        product_type_id: {
          value: formData.product_type_id,
          valid: Boolean(formData.product_type_id)
        },
        region_id: {
          value: formData.region_id,
          valid: Boolean(formData.region_id)
        }
      },
      required_attributes: {}
    };

    // Add required attributes to validation state
    filteredAttributes.forEach(attr => {
      if (attr.is_required) {
        const value = formData.attributes[attr.id];
        
        // For boolean attributes, convert to 0/1 and consider both valid
        const displayValue = attr.type === 'boolean' ? 
          (value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0) :
          value;
        
        const isValid = attr.type === 'boolean' ? 
          value !== undefined && value !== null : // for boolean, only undefined/null is invalid
          Boolean(value); // for other types, any truthy value is valid

        validationState.required_attributes[attr.id] = {
          name: attr.ui_name || attr.name,
          value: displayValue,
          valid: isValid
        };
      }
    });

    console.log('Form Validation State:', validationState);

    // Check if form is valid
    const form = e.currentTarget;
    if (!form.checkValidity() || !validateForm()) {
      e.stopPropagation();
      return;
    }

    setLoading(true);
    try {
      // Create FormData and add all form fields
      const submitData = new FormData();
      
      // Add basic fields
      submitData.append('title', formData.title);
      submitData.append('product_group_id', formData.product_group_id);
      submitData.append('product_type_id', formData.product_type_id);
      submitData.append('region_id', formData.region_id);
      if (formData.rating_group_id) submitData.append('rating_group_id', formData.rating_group_id);
      if (formData.rating_id) submitData.append('rating_id', formData.rating_id);
      if (formData.release_year) submitData.append('release_year', formData.release_year);
      if (formData.description) submitData.append('description', formData.description);
      submitData.append('is_active', 1);
      
      // Add image if exists
      if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      // Add attributes
      Object.entries(formData.attributes).forEach(([id, value]) => {
        const attr = filteredAttributes.find(a => a.id === Number(id));
        if (attr) {
          // Convert boolean values to 0/1
          const submitValue = attr.type === 'boolean' ? 
            (value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0) :
            value;
          submitData.append(`attributes[${id}]`, submitValue);
        }
      });

      // Send the product data to the API
      const response = await axios.post('http://localhost:5000/api/products', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        toast.success(`Product "${formData.title}" Added.`);
        if (onProductAdded) {
          await onProductAdded(response.data.data);
        }
        onHide();
      } else {
        throw new Error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData(prev => ({
          ...prev,
          image_url: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <BaseModal 
      show={show} 
      onHide={onHide}
      size="lg"
      className="new-product-modal"
      debugFormData={true}
      formData={{
        formData,
        attributes: {
          filtered: filteredAttributes,
          hasActive: hasActiveAttributes,
          values: formData.attributes
        },
        ratings: {
          groups: filteredRatingGroups,
          ratings: filteredRatings
        },
        validation: {
          hasSubmitted,
          isValid: formRef.current?.checkValidity()
        }
      }}
    >
      <Form ref={formRef} noValidate onSubmit={handleSubmit}>
        <BaseModalHeader 
          icon={<FaPlus />}
          onHide={onHide}
        >
          Add Product
        </BaseModalHeader>

        <BaseModalBody>
          <Row>
            <Col md={3}>
              <div 
                className={`image-upload-container ${dragActive ? 'drag-active' : ''} ${previewUrl ? 'has-image' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Product preview" className="preview-image" />
                    <div className="hover-overlay">
                      <FaUpload className="upload-icon" />
                    </div>
                  </>
                ) : (
                  <div className="upload-placeholder">
                    <FaImage className="placeholder-icon" />
                    <span className="upload-text">Click or drag image here</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>
            </Col>
            <Col md={9}>
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
                      isInvalid={hasSubmitted && !formData.title}
                    />
                    <Form.Control.Feedback type="invalid">
                      Product Name is required
                    </Form.Control.Feedback>
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
                      isInvalid={hasSubmitted && !formData.product_group_id}
                    >
                      <option value="">Select Group</option>
                      {productGroups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Product Group is required
                    </Form.Control.Feedback>
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
                      isInvalid={hasSubmitted && !formData.product_type_id}
                    >
                      <option value="">Select Type</option>
                      {productTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Product Type is required
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Release Year</Form.Label>
                    <Form.Select
                      name="release_year"
                      value={formData.release_year || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => 1950 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <ChainedSelect
                    name="region_id"
                    label="Region *"
                    value={formData.region_id || ''}
                    onChange={handleRegionChange}
                    options={regions}
                    isRequired={true}
                    isInvalid={hasSubmitted && !formData.region_id}
                    feedback="Region is required"
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
                  />
                </Col>
              </Row>

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

              <Row className="mt-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>
        </BaseModalBody>

        <BaseModalFooter
          onCancel={onHide}
          onConfirm={handleSubmit}
          cancelText="Cancel"
          confirmText={loading ? 'Adding...' : 'Add Product'}
          isLoading={loading}
        />
      </Form>
    </BaseModal>
  );
};

export default NewAddProductModal; 
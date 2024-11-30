import React, { useRef, useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaEdit, FaImage, FaUpload, FaTrashAlt } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../../common/Modal';
import DeleteModal from '../../common/Modal/DeleteModal';
import ChainedSelect from '../../common/Forms/ChainedSelect';
import ProductBasicInfo from './ProductBasicInfo';
import AttributeBox from '../../attributes/AttributeBox';
import './AddProductModal.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const initialFormState = {
  title: '',
  product_group_id: '',
  product_type_id: '',
  region_id: '',
  rating_id: '',
  rating_group_id: '',
  product_image: '',
  release_year: '',
  description: '',
  is_active: true,
  attributes: {}
};

const NewEditProductModal = ({ 
  show, 
  onHide, 
  onProductUpdated,
  productId,
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

  // Fetch product data when modal opens
  useEffect(() => {
    const fetchProduct = async () => {
      if (show && productId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/products`, {
            params: {
              id: productId,
              extended: true
            }
          });
          
          const productData = response.data.data;
          const savedAttributes = productData.attributes || {};
          
          // Find the rating group for the selected rating
          let ratingGroupId = null;
          if (productData.rating_id) {
            const rating = availableRatings.find(r => r.id === productData.rating_id);
            if (rating) {
              ratingGroupId = rating.rating_group_id;
            }
          }
          
          // Set initial form data with rating group
          const formDataToSet = {
            ...productData,
            attributes: {}, // Start with empty attributes
            rating_group_id: ratingGroupId // Set the rating group ID
          };
          
          setFormData(formDataToSet);
          
          // After setting initial form data, fetch and set attributes
          if (productData.product_group_id && productData.product_type_id) {
            await fetchAttributes(
              productData.product_group_id, 
              productData.product_type_id, 
              savedAttributes
            );
          }
          
          if (productData.productImageOriginal) {
            setPreviewUrl(productData.productImageOriginal);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url
          });
        }
      }
    };
  
    fetchProduct();
  }, [show, productId, availableRatings]);

  // Modified fetchAttributes to accept saved attribute values
  const fetchAttributes = async (groupId, typeId, savedValues = {}) => {
    if (!groupId || !typeId) {
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
          groupIds.includes(Number(groupId));

        const matchesType = typeIds.length === 0 || 
          typeIds.includes(Number(typeId));

        return matchesGroup && matchesType && attr.is_active === 1;
      });

      setFilteredAttributes(filteredAttrs);

      // Map the saved values to the filtered attributes
      const attributeValues = {};
      filteredAttrs.forEach(attr => {
        // Map attribute names to their IDs
        if (attr.name === 'developerName' && savedValues.developerName) {
          attributeValues[attr.id] = savedValues.developerName;
        }
        if (attr.name === 'publisherName' && savedValues.publisherName) {
          attributeValues[attr.id] = savedValues.publisherName;
        }
        if (attr.name === 'gameGenre' && savedValues.gameGenre) {
          attributeValues[attr.id] = savedValues.gameGenre;
        }
        if (attr.name === 'isKinect' && savedValues.isKinect) {
          attributeValues[attr.id] = savedValues.isKinect;
        }
      });
      
      // Update form data with the mapped attribute values
      setFormData(prev => ({
        ...prev,
        attributes: attributeValues
      }));

    } catch (err) {
      console.error('Failed to fetch attributes:', err);
      setFilteredAttributes([]);
    }
  };

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
        
        // For boolean attributes, consider both 0 and 1 as valid values
        const isEmpty = attr.type === 'boolean' ? 
          value === undefined || value === null || value === '' : // only undefined/null/empty string is invalid
          !value; // for other types, empty string or falsy value is invalid

        if (isEmpty) {
          errors.push(`${attr.ui_name || attr.name} is required`);
          invalidFields.required_attributes[attr.id] = value;

          // If we haven't found a first invalid element yet, try to find this attribute's input
          if (!firstInvalidElement) {
            const element = document.querySelector(`[data-attribute-id="${attr.id}"]`);
            if (element) firstInvalidElement = element;
          }
        }
      }
    });

    // Focus the first invalid element if we found one
    if (firstInvalidElement) {
      firstInvalidElement.focus();
    }

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Check if form is valid
    const form = e.currentTarget;
    if (!form.checkValidity() || !validateForm()) {
      e.stopPropagation();
      return;
    }

    setLoading(true);
    try {
      // Prepare the product data
      const productData = {
        title: formData.title,
        product_group_id: formData.product_group_id,
        product_type_id: formData.product_type_id,
        region_id: formData.region_id,
        rating_id: formData.rating_id || null,
        release_year: formData.release_year || null,
        description: formData.description || null,
        is_active: 1,
        product_image: formData.product_image || null
      };

      // Prepare attribute values
      const attributeValues = Object.entries(formData.attributes).map(([id, value]) => {
        const attr = filteredAttributes.find(a => a.id === Number(id));
        if (attr) {
          return {
            attribute_id: Number(id),
            value: attr.type === 'boolean' ? 
              (value === true || value === 'true' || value === 1 || value === '1' ? '1' : '0') :
              String(value)
          };
        }
        return null;
      }).filter(Boolean);

      // Prepare the request data
      const requestData = {
        ...productData,
        attributes: attributeValues
      };

      // Send to single endpoint that handles both product and attribute update
      const response = await axios.put(`http://localhost:5000/api/products/${productId}`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast.success(`Product "${formData.title}" Updated.`);
      if (onProductUpdated) {
        await onProductUpdated(response.data.data);
      }
      onHide();
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response) {
        toast.error(error.response.data.error || 'Failed to update product');
      } else {
        toast.error(error.message || 'Failed to update product');
      }
      setWarning(error.message);
    } finally {
      setLoading(false);
    }
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

    const currentAttributes = formData.attributes || {};
    const updatedAttributes = Object.fromEntries(
      Object.entries(currentAttributes)
        .filter(([key]) => validAttributeIds.includes(Number(key)))
    );

    setFormData(prev => ({
      ...prev,
      product_group_id: groupId,
      attributes: updatedAttributes
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

    const currentAttributes = formData.attributes || {};
    const updatedAttributes = Object.fromEntries(
      Object.entries(currentAttributes)
        .filter(([key]) => validAttributeIds.includes(Number(key)))
    );

    setFormData(prev => ({
      ...prev,
      product_type_id: typeId,
      attributes: updatedAttributes
    }));
  };

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

  const handleDeleteImage = async () => {
    try {
      // Delete the image
      await axios.delete(`http://localhost:5000/api/products/${productId}/image`);
      
      // Fetch the updated product data
      const response = await axios.get(`http://localhost:5000/api/products`, {
        params: {
          id: productId,
          extended: true
        }
      });
      
      // Update local state
      setPreviewUrl('');
      setFormData(prev => ({
        ...prev,
        product_image: null,
        productImageOriginal: null,
        productImageThumbnail: null
      }));
      
      // Update the parent component/table with the fresh data
      if (onProductUpdated && response.data.data) {
        await onProductUpdated(response.data.data);
      }
      
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData(prev => ({
          ...prev,
          product_image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredRatingGroups = availableRatingGroups.filter(group => 
    group.region_id === formData.region_id
  );

  const filteredRatings = availableRatings.filter(rating => 
    rating.rating_group_id === formData.rating_group_id
  );

  const hasActiveAttributes = filteredAttributes.length > 0;

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
          icon={<FaEdit />}
          onHide={onHide}
        >
          Edit Product
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
                  <div className="image-preview-wrapper">
                    <img src={previewUrl} alt="Product preview" className="preview-image" />
                    <div className="hover-overlay">
                      <FaUpload className="upload-icon" />
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm delete-image-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage();
                      }}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
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
                            <AttributeBox
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
          confirmText={loading ? 'Updating...' : 'Update Product'}
          isLoading={loading}
        />
      </Form>
    </BaseModal>
  );
};

export default NewEditProductModal;

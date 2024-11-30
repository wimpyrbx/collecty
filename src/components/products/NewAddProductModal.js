import React, { useRef, useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaPlus, FaImage, FaUpload, FaTrashAlt } from 'react-icons/fa';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../BaseModal';
import ProductBasicInfo from './ProductBasicInfo';
import ProductAdditionalInfo from './ProductAdditionalInfo';
import ProductAttributeBox from './ProductAttributeBox';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
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
  productGroups = [],
  productTypes = [],
  regions = [],
  availableRatingGroups = [],
  availableRatings = [],
  attributes = [],
  attributeValues = {},
  initialData = {}
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (show) {
      if (Object.keys(initialData).length > 0) {
        setFormData({
          ...initialFormState,
          ...initialData
        });
        if (initialData.productImageOriginal) {
          setPreviewUrl(initialData.productImageOriginal);
        }
      } else {
        setFormData(initialFormState);
        setPreviewUrl('');
      }
      setHasSubmitted(false);
      setWarning('');
      
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [show, initialData]);

  useEffect(() => {
    if (!formData.product_group_id || !formData.product_type_id) {
      setFilteredAttributes([]);
      return;
    }

    const filtered = attributes.filter(attr => {
      const groupIds = Array.isArray(attr.product_group_ids) 
        ? attr.product_group_ids 
        : JSON.parse(attr.product_group_ids || '[]');
      
      const typeIds = Array.isArray(attr.product_type_ids)
        ? attr.product_type_ids
        : JSON.parse(attr.product_type_ids || '[]');

      const matchesGroup = groupIds.length === 0 || 
        groupIds.includes(Number(formData.product_group_id));

      const matchesType = typeIds.length === 0 || 
        typeIds.includes(Number(formData.product_type_id));

      return matchesGroup && matchesType;
    });

    setFilteredAttributes(filtered);

    // Clean up any attributes that are no longer valid
    const validAttributeIds = filtered.map(attr => attr.id);
    setFormData(prev => ({
      ...prev,
      attributes: Object.fromEntries(
        Object.entries(prev.attributes).filter(([key]) => 
          validAttributeIds.includes(Number(key))
        )
      )
    }));
  }, [formData.product_group_id, formData.product_type_id, attributes]);

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
      }
      setTimeout(() => {
        if (ratingSelectRef.current) {
          ratingSelectRef.current.focus();
        }
      }, 0);
    }
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

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      console.log('Processing image file:', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image converted to base64');
        setPreviewUrl(reader.result);
        setFormData(prev => ({
          ...prev,
          image_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    try {
      if (formData.id) {
        await axios.delete(`http://localhost:5000/api/products/${formData.id}/image`);
      }
      setPreviewUrl('');
      setFormData(prev => ({
        ...prev,
        image_url: null
      }));
      toast.success('Image deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Add validation for required attributes
    const requiredAttributeErrors = filteredAttributes
      .filter(attr => attr.is_required === 1)
      .filter(attr => {
        const value = formData.attributes[attr.id];
        const isEmpty = attr.type === 'boolean' ? 
          (value === undefined || value === null || value === '') :
          (!value && value !== 0 && value !== '0');
        return isEmpty;
      });

    if (requiredAttributeErrors.length > 0) {
      // Find and focus the first missing attribute input
      const firstMissingAttrId = requiredAttributeErrors[0].id;
      const attributeInput = document.querySelector(`[data-attribute-input="${firstMissingAttrId}"]`);
      if (attributeInput) {
        attributeInput.focus();
      }
      return;
    }

    // Check other required fields and focus the first missing one
    if (!formRef.current?.checkValidity()) {
      const firstInvalidField = formRef.current.querySelector(':invalid');
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
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
        image_url: formData.image_url || null
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

      const requestData = {
        ...productData,
        attributes: attributeValues
      };

      const response = await axios.post('http://localhost:5000/api/products', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast.success(`Product "${formData.title}" added successfully.`);
      if (onProductAdded) {
        await onProductAdded(response.data.data);
      }
      onHide();
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.error || 'Failed to add product');
      } else {
        toast.error(error.message || 'Failed to add product');
      }
      setWarning(error.message);
    } finally {
      setLoading(false);
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
    <>
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
            values: formData.attributes,
            required: filteredAttributes.filter(attr => attr.is_required === 1)
          },
          ratings: {
            groups: filteredRatingGroups,
            ratings: filteredRatings
          },
          validation: {
            hasSubmitted,
            isValid: formRef.current?.checkValidity(),
            attributeValidation: filteredAttributes
              .filter(attr => attr.is_required === 1)
              .map(attr => ({
                name: attr.name,
                value: formData.attributes[attr.id],
                isValid: !!formData.attributes[attr.id]
              }))
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
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
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
                {previewUrl && (
                  <div className="image-actions">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <FaTrashAlt className="me-1" /> Delete Image
                    </Button>
                  </div>
                )}
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

      <DeleteConfirmationModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteImage}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />
    </>
  );
};

export default NewAddProductModal; 
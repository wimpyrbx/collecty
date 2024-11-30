import React, { useRef, useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaPlus, FaImage, FaUpload, FaTrashAlt } from 'react-icons/fa';
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
  initialData = {},
  preselectedGroup = '',
  preselectedType = '',
  preselectedRegion = ''
}) => {
  const [formData, setFormData] = useState({
    ...initialFormState,
    product_group_id: preselectedGroup || '',
    product_type_id: preselectedType || '',
    region_id: preselectedRegion || ''
  });
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

  // Handle preselected region and rating group
  useEffect(() => {
    if (show && formData.region_id) {
      const regionId = Number(formData.region_id);
      const groupsForRegion = availableRatingGroups.filter(g => g.region_id === regionId);
      
      if (groupsForRegion.length === 1) {
        const groupId = groupsForRegion[0].id;
        const ratingsForGroup = availableRatings.filter(r => r.rating_group_id === groupId);
        
        setFormData(prev => {
          const updated = {
            ...prev,
            rating_group_id: groupId,
            rating_id: ratingsForGroup.length === 1 ? ratingsForGroup[0].id : ''
          };
          return updated;
        });
      }
    }
  }, [show, formData.region_id, availableRatingGroups, availableRatings]);

  useEffect(() => {
    if (show) {
      if (!formData.title) {
        if (Object.keys(initialData).length > 0) {
          setFormData({
            ...initialFormState,
            ...initialData
          });
          if (initialData.productImageOriginal) {
            setPreviewUrl(initialData.productImageOriginal);
          }
        } else {
          const newFormData = {
            ...initialFormState,
            product_group_id: preselectedGroup || '',
            product_type_id: preselectedType || '',
            region_id: preselectedRegion || ''
          };
          setFormData(newFormData);
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
    }
  }, [show, preselectedGroup, preselectedType, preselectedRegion]);

  useEffect(() => {
    if (!formData.product_group_id || !formData.product_type_id) {
      setFilteredAttributes([]);
      return;
    }

    const filtered = attributes.filter(attr => {
      try {
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
      } catch (error) {
        console.error('Error parsing attribute IDs:', error);
        return false;
      }
    });

    setFilteredAttributes(filtered);

    if (filtered.length > 0) {
      const validAttributeIds = filtered.map(attr => attr.id);
      setFormData(prev => ({
        ...prev,
        attributes: Object.fromEntries(
          Object.entries(prev.attributes).filter(([key]) => 
            validAttributeIds.includes(Number(key))
          )
        )
      }));
    }
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

  const handleDeleteImage = async () => {
    try {
      if (formData.id) {
        await axios.delete(`http://localhost:5000/api/products/${formData.id}/image`);
      }
      setPreviewUrl('');
      setFormData(prev => ({
        ...prev,
        product_image: null
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
        variant: formData.variant || null,
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
    Number(formData.region_id) === group.region_id
  );

  const filteredRatings = availableRatings.filter(rating => 
    Number(formData.rating_group_id) === rating.rating_group_id
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
                  <Col md={6}>
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
                  <Col md={5}>
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
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Variant</Form.Label>
                      <Form.Control
                        type="text"
                        name="variant"
                        value={formData.variant || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year</Form.Label>
                      <Form.Select
                        name="release_year"
                        value={formData.release_year || ''}
                        onChange={handleInputChange}
                      >
                        <option value=""></option>
                        {Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => 1950 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
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
                  <Col md={4}>
                    <ChainedSelect
                      name="rating_group_id"
                      label="Rating Group"
                      value={formData.rating_group_id || ''}
                      onChange={handleRatingGroupChange}
                      options={filteredRatingGroups}
                      disabled={!formData.region_id}
                    />
                  </Col>
                  <Col md={4}>
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
                            <Col md={4} key={attribute.id}>
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
            confirmText={loading ? 'Adding...' : 'Add Product'}
            isLoading={loading}
          />
        </Form>
      </BaseModal>

      <DeleteModal
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
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './AddProductModal.css';
import ChainedSelect from '../common/ChainedSelect';
import ProductAttributeBox from './ProductAttributeBox';
import AttributesSection from './AttributesSection';
import ProductBasicInfo from './ProductBasicInfo';
import ProductAdditionalInfo from './ProductAdditionalInfo';

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
  is_active: true
};

const AddProductModal = ({ show, onHide, onProductAdded, initialData = null }) => {
  const [formData, setFormData] = useState(initialFormState);

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
  const nameInputRef = useRef(null);
  const [warning, setWarning] = useState('');
  const warningTimeoutRef = useRef(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Function to show warning
  const showWarning = (message) => {
    setWarning(message);
    // Clear any existing timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    // Set new timeout to clear warning after 3 seconds
    warningTimeoutRef.current = setTimeout(() => {
      setWarning('');
    }, 3000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  // Move fetchReferenceData outside of useEffect
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
      setError('Failed to load reference data');
    }
  };

  // First useEffect for modal show/hide
  useEffect(() => {
    if (show) {
      // Reset all form state when modal opens
      setFormData(initialFormState);
      setAttributeValues({});
      setAttributes([]);
      setError(null);
      setTouched(false);
      setLoading(false);
      setAvailableRatings([]);
      setAvailableRatingGroups([]);
      setHasSubmitted(false);
      
      // Fetch reference data
      fetchReferenceData();

      // Focus the name input after a short delay to ensure modal is fully rendered
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [show]);

  // Update the attributes fetch effect
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!formData.product_group_id || !formData.product_type_id) {
        setAttributes([]);
        setAttributeValues({});
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/attributes', {
          params: { 
            scope: 'product',
            productGroupId: formData.product_group_id,
            productTypeId: formData.product_type_id,
            sortOrder: 'asc'
          }
        });

        console.log('Fetched attributes:', response.data.data);
        setAttributes(response.data.data || []);

        // Initialize attribute values with defaults only for boolean types
        const newAttributeValues = {};
        response.data.data.forEach(attr => {
          if (attr.type === 'boolean' && attr.default_value) {
            newAttributeValues[attr.id] = attr.default_value;
          }
          // Don't set default values for other types (set, string, number)
        });
        setAttributeValues(prev => ({
          ...prev,
          ...newAttributeValues
        }));

      } catch (err) {
        console.error('Failed to fetch attributes:', err);
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
        group => group.region_id === parseInt(value, 10)
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

      // Focus next dropdown after a small delay
      setTimeout(() => {
        if (newRatingGroupId) {
          // If we auto-selected a rating group, focus the rating dropdown
          const ratingSelect = document.querySelector('[name="rating_id"]');
          if (ratingSelect) {
            ratingSelect.focus();
            const filteredRatings = ratings.filter(
              rating => rating.rating_group_id === parseInt(newRatingGroupId, 10)
            );
            setAvailableRatings(filteredRatings);
          }
        } else {
          // Otherwise focus the rating group dropdown
          const ratingGroupSelect = document.querySelector('[name="rating_group_id"]');
          if (ratingGroupSelect) {
            ratingGroupSelect.focus();
          }
        }
      }, 0);

    } else if (name === 'rating_group_id') {
      const filteredRatings = ratings.filter(
        rating => rating.rating_group_id === parseInt(value, 10)
      );
      setAvailableRatings(filteredRatings);
      setFormData(prev => ({
        ...prev,
        rating_group_id: value,
        rating_id: ''
      }));

      // Focus rating dropdown after a small delay
      setTimeout(() => {
        const ratingSelect = document.querySelector('[name="rating_id"]');
        if (ratingSelect) {
          ratingSelect.focus();
        }
      }, 0);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAttributeChange = (attributeId, value) => {
    // Only clear validation errors if form has been submitted
    if (hasSubmitted && value) {
      setError(null);
    }

    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  // Update validateForm to only check required fields
  const validateForm = () => {
    const errors = [];

    // Required fields validation
    if (!formData.title) errors.push('* Required');
    if (!formData.product_group_id) errors.push('* Required');
    if (!formData.product_type_id) errors.push('* Required');
    if (!formData.region_id) errors.push('* Required');

    // Required attributes validation
    const requiredAttributes = attributes.filter(attr => attr.is_required);
    for (const attr of requiredAttributes) {
      if (!attributeValues[attr.id]) {
        errors.push('* Required');
      }
    }

    return errors.length > 0 ? errors.join('\n') : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    console.log('=== Form Submission ===');
    console.log('Form Data:', formData);
    console.log('Attribute Values:', attributeValues);
    console.log('Available Attributes:', attributes);

    const validationError = validateForm();
    if (validationError) {
      console.log('Validation Error:', validationError);
      showWarning('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        product_group_id: parseInt(formData.product_group_id, 10),
        product_type_id: parseInt(formData.product_type_id, 10),
        region_id: parseInt(formData.region_id, 10),
        rating_id: formData.rating_id ? parseInt(formData.rating_id, 10) : null,
        rating_group_id: formData.rating_group_id ? parseInt(formData.rating_group_id, 10) : null,
        release_year: formData.release_year ? parseInt(formData.release_year, 10) : null,
        attributes: attributeValues
      };

      console.log('=== Sending Payload ===');
      console.log('Payload:', payload);

      const response = await axios.post('http://localhost:5000/api/products', payload);
      console.log('=== Response ===');
      console.log('Response:', response.data);

      toast.success('Product created successfully');
      onProductAdded();
      onHide();
    } catch (err) {
      console.error('=== Error Creating Product ===');
      console.error('Error:', err);
      console.error('Response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to create product');
      toast.error(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="product-modal">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{initialData ? 'Edit' : 'Add New'} Product</Modal.Title>
        {warning && (
          <div className="modal-warning">
            {warning}
          </div>
        )}
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="bg-light">
          <ProductBasicInfo
            formData={formData}
            onChange={handleInputChange}
            productGroups={productGroups || []}
            productTypes={productTypes || []}
            regions={regions || []}
            availableRatingGroups={availableRatingGroups || []}
            availableRatings={availableRatings || []}
            attributes={attributes}
            attributeValues={attributeValues}
            handleAttributeChange={handleAttributeChange}
            hasSubmitted={hasSubmitted}
            nameInputRef={nameInputRef}
          />

          <ProductAdditionalInfo
            formData={formData}
            onChange={handleInputChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update' : 'Create')} Product
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProductModal; 
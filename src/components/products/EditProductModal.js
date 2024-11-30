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

const EditProductModal = ({ show, onHide, productId, onProductUpdated }) => {
  const [formData, setFormData] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingGroups, setRatingGroups] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [availableRatingGroups, setAvailableRatingGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attributeValues, setAttributeValues] = useState({});
  const [touched, setTouched] = useState(false);
  const nameInputRef = useRef(null);
  const [warning, setWarning] = useState('');
  const warningTimeoutRef = useRef(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Fetch product data when modal opens
  useEffect(() => {
    if (show && productId) {
      const fetchData = async () => {
        try {
          // First fetch reference data
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

          // Then fetch product data
          const response = await axios.get('http://localhost:5000/api/products', {
            params: {
              id: productId,
              extended: true
            }
          });
          
          const productData = response.data.data;

          // Set up available rating groups for the region regardless of rating_id
          if (productData.region_id) {
            const regionRatingGroups = ratingGroupsRes.data.data.filter(
              group => group.region_id === productData.region_id
            );
            setAvailableRatingGroups(regionRatingGroups);

            // If there's a rating_id, set up the ratings for its group
            if (productData.rating_id) {
              const rating = ratingsRes.data.data.find(r => r.id === productData.rating_id);
              if (rating) {
                const groupRatings = ratingsRes.data.data.filter(
                  r => r.rating_group_id === rating.rating_group_id
                );
                setAvailableRatings(groupRatings);
              }
            }
          }

          // Now set form data with all values
          setFormData({
            title: productData.title,
            product_group_id: productData.product_group_id.toString(),
            product_type_id: productData.product_type_id || '',
            region_id: productData.region_id || '',
            rating_id: productData.rating_id || '',
            rating_group_id: '',
            product_image: productData.product_image || '',
            release_year: productData.release_year || '',
            description: productData.description || '',
            is_active: productData.is_active
          });

          // Fetch and set attributes
          const attributesResponse = await axios.get('http://localhost:5000/api/attributes', {
            params: { 
              scope: 'product',
              productGroupId: productData.product_group_id,
              productTypeId: productData.product_type_id,
              sortOrder: 'asc'
            }
          });

          setAttributes(attributesResponse.data.data || []);

          // Map attribute values
          if (productData.attributes) {
            const attributeValueMap = {};
            Object.entries(productData.attributes).forEach(([key, value]) => {
              const attribute = attributesResponse.data.data.find(attr => attr.name === key);
              if (attribute) {
                attributeValueMap[attribute.id] = value;
              }
            });
            setAttributeValues(attributeValueMap);
          }

        } catch (err) {
          toast.error('Failed to load product data');
          console.error('Error fetching product:', err);
        }
      };

      fetchData();
    }
  }, [show, productId]);

  useEffect(() => {
    if (show && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [show]);

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
    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    //console.log('=== Edit Modal Submit ===');
    //console.log('Form Data:', formData);
    //console.log('Attribute Values:', attributeValues);

    if (!formData.title || !formData.product_group_id || 
        !formData.product_type_id || !formData.region_id) {
      setWarning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // First update the product
      const productPayload = {
        ...formData,
        product_group_id: parseInt(formData.product_group_id, 10),
        product_type_id: parseInt(formData.product_type_id, 10),
        region_id: parseInt(formData.region_id, 10),
        rating_id: formData.rating_id ? parseInt(formData.rating_id, 10) : null,
        rating_group_id: formData.rating_group_id ? parseInt(formData.rating_group_id, 10) : null,
        release_year: formData.release_year ? parseInt(formData.release_year, 10) : null
      };

      //console.log('=== Updating Product ===');
      //console.log('Product Payload:', productPayload);

      await axios.put(`http://localhost:5000/api/products/${productId}`, productPayload);

      // Then cleanup and update attributes
      if (Object.keys(attributeValues).length > 0) {
        //console.log('=== Updating Attributes ===');
        
        // Clean up old attributes
        await axios.post('http://localhost:5000/api/product-attribute-values/cleanup', {
          productId
        });

        // Update attribute values
        for (const [attributeId, value] of Object.entries(attributeValues)) {
          await axios.post('http://localhost:5000/api/product-attribute-values', {
            product_id: productId,
            attribute_id: parseInt(attributeId, 10),
            value: value
          });
        }
      }

      toast.success('Product updated successfully');
      onProductUpdated();
      onHide();
    } catch (err) {
      console.error('=== Update Error ===');
      console.error('Error:', err);
      console.error('Response:', err.response?.data);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" className="product-modal">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Edit Product</Modal.Title>
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
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditProductModal; 
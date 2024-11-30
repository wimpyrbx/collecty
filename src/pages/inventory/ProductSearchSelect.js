import React, { useState, useEffect, useRef } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { debounce } from 'lodash';
import './ProductSearchSelect.css';

const ProductSearchSelect = ({ onSelect, isInvalid }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  const searchProducts = debounce(async (term) => {
    if (!term) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        params: {
          search: term,
          extended: true
        }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    searchProducts(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product) => {
    setSearchTerm(product.title);
    setShowResults(false);
    onSelect(product);
  };

  return (
    <div ref={wrapperRef} className="product-search-select">
      <Form.Control
        type="text"
        placeholder="Search for a product..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        isInvalid={isInvalid}
      />
      
      {showResults && (searchTerm || loading) && (
        <ListGroup className="search-results">
          {loading ? (
            <ListGroup.Item className="text-center">Loading...</ListGroup.Item>
          ) : products.length > 0 ? (
            products.map(product => (
              <ListGroup.Item
                key={product.id}
                action
                onClick={() => handleSelect(product)}
                className="product-item"
              >
                {product.productImageThumbnail && (
                  <img 
                    src={product.productImageThumbnail}
                    alt={product.title}
                    className="product-thumbnail"
                  />
                )}
                <div className="product-info">
                  <div className="product-title">{product.title}</div>
                  <div className="product-details">
                    <span>{product.productGroup?.name}</span>
                    <span>{product.region?.name}</span>
                  </div>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-center">No products found</ListGroup.Item>
          )}
        </ListGroup>
      )}
    </div>
  );
};

export default ProductSearchSelect; 
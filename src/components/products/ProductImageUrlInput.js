import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import ProductImagePreview from './ProductImagePreview';
import './ProductImageUrlInput.css';

const ProductImageUrlInput = ({ value, onChange }) => {
  const [imageUrl, setImageUrl] = useState(value);

  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (imageUrl !== value) {
        onChange({ target: { name: 'image_url', value: imageUrl } });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [imageUrl, value, onChange]);

  return (
    <div className="image-url-input-container">
      <ProductImagePreview imageUrl={imageUrl} size="medium" />
      <div className="form-content">
        <Form.Label>Product Image URL</Form.Label>
        <Form.Control
          type="url"
          name="image_url"
          value={imageUrl || ''}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://"
        />
      </div>
    </div>
  );
};

export default ProductImageUrlInput; 
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { FaImage } from 'react-icons/fa';
import './ProductImageUrlInput.css';

const ProductImageUrlInput = ({ value, onChange }) => {
  const [imageUrl, setImageUrl] = useState(value);
  const [imageError, setImageError] = useState(false);

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

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const renderPreview = () => {
    if (!imageUrl) {
      return (
        <div className="image-preview placeholder">
          <FaImage />
        </div>
      );
    }

    return (
      <div className="image-preview">
        <img 
          src={imageUrl} 
          alt="Preview"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {imageError && (
          <div className="error-overlay">
            <FaImage />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="image-url-input-container">
      {renderPreview()}
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
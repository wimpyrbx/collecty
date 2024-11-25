import React from 'react';
import { FaImage } from 'react-icons/fa';
import './ProductImagePreview.css';

const ProductImagePreview = ({ imageUrl, size = 'medium' }) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  if (!imageUrl) {
    return (
      <div className={`image-preview placeholder ${size}`}>
        <FaImage />
      </div>
    );
  }

  return (
    <div className={`image-preview ${size}`}>
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

export default ProductImagePreview; 
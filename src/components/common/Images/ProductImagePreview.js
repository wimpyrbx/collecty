import React from 'react';
import { FaImage } from 'react-icons/fa';
import './ProductImagePreview.css';

const ProductImagePreview = ({ imageSrc, size = 'medium' }) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  if (!imageSrc) {
    return (
      <div className={`image-preview placeholder ${size}`}>
        <FaImage />
      </div>
    );
  }

  return (
    <div className={`image-preview ${size}`}>
      <img 
        src={imageSrc} 
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
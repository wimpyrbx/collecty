import React from 'react';
import './ProductTypeImage.css';

const ProductTypeImage = ({ typeName }) => {
  if (!typeName) return null;

  const getImageName = (name) => {
    // Handle special cases
    if (name.toLowerCase() === 'peripheral') {
      return 'peripherals';
    }
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const imagePath = `/assets/images/product_type/${getImageName(typeName)}.webp`;

  return (
    <img 
      src={imagePath}
      alt={typeName}
      title={typeName}
      className="product-type-image"
      onError={(e) => {
        console.warn(`Failed to load product type image for ${typeName}`);
        e.target.style.display = 'none';
      }}
    />
  );
};

export default ProductTypeImage; 
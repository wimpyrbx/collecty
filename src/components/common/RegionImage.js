import React from 'react';
import './RegionImage.css';

const RegionImage = ({ regionName, size = 24 }) => {
  if (!regionName) return null;

  const imageName = regionName.toLowerCase().replace(/\s+/g, '-');
  const imagePath = `/assets/images/regions/${imageName}.webp`;

  return (
    <img 
      src={imagePath}
      alt={regionName}
      title={regionName}
      className="region-image"
      style={{ 
        maxWidth: '24px',
        maxHeight: '24px',
        width: size,
        height: size,
        objectFit: 'contain'
      }}
      onError={(e) => {
        console.warn(`Failed to load region image for ${regionName}`);
        e.target.style.display = 'none';
      }}
    />
  );
};

export default RegionImage; 
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Helper function to create directory if it doesn't exist
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Helper function to get directory structure based on ID
function getImagePaths(id) {
  const idStr = id.toString();
  const x = idStr.length > 1 ? idStr[0] : '0';
  const y = idStr[idStr.length - 1];
  
  const originalDir = path.join('public', 'assets', 'images', 'products', 'original', x, y);
  const thumbDir = path.join('public', 'assets', 'images', 'products', 'thumb', x, y);
  const filename = `${id}.webp`;
  
  return {
    originalDir,
    thumbDir,
    filename,
    originalPath: path.join(originalDir, filename),
    thumbPath: path.join(thumbDir, filename),
    x,
    y
  };
}

// Helper function to process and save image
async function processImage(imageData, productId) {
  console.log('Processing image for product:', productId);
  const paths = getImagePaths(productId);
  
  console.log('Image paths:', {
    originalDir: paths.originalDir,
    thumbDir: paths.thumbDir,
    filename: paths.filename
  });

  // Create directories if they don't exist
  await ensureDir(paths.originalDir);
  await ensureDir(paths.thumbDir);
  console.log('Directories created/verified');

  // Remove base64 prefix if present
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  console.log('Image data converted to buffer');

  try {
    // Process original image
    console.log('Processing original image...');
    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(paths.originalPath);
    console.log('Original image saved:', paths.originalPath);

    // Process thumbnail
    console.log('Processing thumbnail...');
    await sharp(buffer)
      .resize({ height: 70, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 80 })
      .toFile(paths.thumbPath);
    console.log('Thumbnail saved:', paths.thumbPath);

    return true;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Helper function to delete image files
async function deleteProductImages(productId) {
  const paths = getImagePaths(productId);
  try {
    await fs.unlink(paths.originalPath);
    await fs.unlink(paths.thumbPath);
  } catch (err) {
    console.log('No existing images to delete');
  }
}

module.exports = {
  processImage,
  deleteProductImages,
  getImagePaths
}; 
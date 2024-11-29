const express = require('express');
const router = express.Router();
const db = require('../../db');
const { processImage, deleteProductImages } = require('./imageUtils');

// Add endpoint for deleting image
router.delete('/:id/image', async (req, res) => {
  const productId = req.params.id;
  
  try {
    await deleteProductImages(productId);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const productId = req.params.id;
  const {
    title,
    product_group_id,
    product_type_id,
    region_id,
    rating_id,
    image_url,
    release_year,
    description,
    is_active,
    attributes
  } = req.body;

  console.log('=== PUT /products/:id ===');
  console.log('Product ID:', productId);
  console.log('Image data present:', image_url ? 'Yes (base64)' : 'No');

  try {
    // Start transaction
    await db.runAsync('BEGIN TRANSACTION');

    // Handle image if provided
    if (image_url && image_url.startsWith('data:image')) {
      console.log('Processing new image...');
      try {
        await processImage(image_url, productId);
        console.log('Image processing complete');
      } catch (error) {
        console.error('Failed to process image:', error);
        throw new Error('Failed to process image: ' + error.message);
      }
    }

    // Update product
    const productSql = `
      UPDATE products 
      SET 
        title = ?,
        product_group_id = ?,
        product_type_id = ?,
        region_id = ?,
        rating_id = ?,
        release_year = ?,
        description = ?,
        is_active = ?
      WHERE id = ?
    `;
    
    const productParams = [
      title,
      product_group_id,
      product_type_id,
      region_id,
      rating_id || null,
      release_year || null,
      description || null,
      is_active !== undefined ? is_active : 1,
      productId
    ];

    console.log('Updating product');
    await db.runAsync(productSql, productParams);

    // Handle attributes
    if (attributes && attributes.length > 0) {
      // Delete existing attributes
      const deleteSql = 'DELETE FROM product_attribute_values WHERE product_id = ?';
      await db.runAsync(deleteSql, [productId]);

      // Insert new attributes
      const insertSql = 'INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES (?, ?, ?)';
      for (const attr of attributes) {
        await db.runAsync(insertSql, [productId, attr.attribute_id, attr.value]);
      }
    }

    // Commit transaction
    await db.runAsync('COMMIT');

    // Get updated product data
    const product = await db.getAsync(`
      SELECT 
        p.*,
        pg.name as product_group_name,
        pt.name as product_type_name,
        r.name as region_name,
        rt.name as rating_name,
        rtg.name as rating_group_name
      FROM products p
      LEFT JOIN product_groups pg ON p.product_group_id = pg.id
      LEFT JOIN product_types pt ON p.product_type_id = pt.id
      LEFT JOIN regions r ON p.region_id = r.id
      LEFT JOIN ratings rt ON p.rating_id = rt.id
      LEFT JOIN rating_groups rtg ON rt.rating_group_id = rtg.id
      WHERE p.id = ?
    `, [productId]);

    // Get updated attributes
    const updatedAttributes = await db.allAsync(`
      SELECT pav.*, a.name, a.type
      FROM product_attribute_values pav
      JOIN attributes a ON pav.attribute_id = a.id
      WHERE pav.product_id = ?
    `, [productId]);

    const response = {
      message: 'Product updated successfully',
      data: {
        ...product,
        attributes: updatedAttributes.reduce((acc, curr) => ({
          ...acc,
          [curr.name]: curr.value
        }), {})
      }
    };

    res.json(response);

  } catch (err) {
    console.error('Error in PUT /products/:id:', err);
    await db.runAsync('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
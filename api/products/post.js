const express = require('express');
const router = express.Router();
const db = require('../../db');
const { processImage } = require('./imageUtils');

router.post('/', async (req, res) => {
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

  if (!title || !product_group_id || !product_type_id || !region_id) {
    return res.status(400).json({
      error: 'Missing required fields: title, product_group_id, product_type_id, and region_id are required'
    });
  }

  try {
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // First, check if a product with the same title, group, and region exists
    const existingProduct = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM products WHERE title = ? AND product_group_id = ? AND region_id = ?',
        [title, product_group_id, region_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingProduct) {
      throw new Error('A product with this title already exists in this group and region');
    }

    // Insert the product
    const result = await new Promise((resolve, reject) => {
      const sql = `INSERT INTO products (
        title,
        product_group_id,
        product_type_id,
        region_id,
        rating_id,
        release_year,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const params = [
        title,
        product_group_id,
        product_type_id,
        region_id,
        rating_id || null,
        release_year || null,
        description || null,
        is_active !== undefined ? is_active : 1
      ];

      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    const productId = result.lastID;

    // Process image if provided
    if (image_url && image_url.startsWith('data:image')) {
      try {
        await processImage(image_url, productId);
      } catch (error) {
        throw new Error('Failed to process image: ' + error.message);
      }
    }

    // Insert attributes if any
    if (attributes && attributes.length > 0) {
      // First, validate that all attributes exist
      const attributeIds = attributes.map(attr => attr.attribute_id);
      const validAttributes = await new Promise((resolve, reject) => {
        const placeholders = attributeIds.map(() => '?').join(',');
        db.all(
          `SELECT id FROM attributes WHERE id IN (${placeholders})`,
          attributeIds,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.id));
          }
        );
      });

      // Check if all attributes are valid
      const invalidAttributes = attributeIds.filter(id => !validAttributes.includes(id));
      if (invalidAttributes.length > 0) {
        throw new Error(`Invalid attribute IDs: ${invalidAttributes.join(', ')}`);
      }

      // Insert all attributes
      for (const attr of attributes) {
        try {
          await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES (?, ?, ?)';
            const params = [productId, attr.attribute_id, attr.value];
            
            db.run(sql, params, function(err) {
              if (err) {
                // If there's a unique constraint violation, provide a clearer error
                if (err.message.includes('UNIQUE constraint failed')) {
                  reject(new Error(`Duplicate attribute value for attribute ID ${attr.attribute_id}`));
                } else {
                  reject(err);
                }
              } else {
                resolve();
              }
            });
          });
        } catch (err) {
          // If any attribute insert fails, throw the error to trigger rollback
          throw err;
        }
      }
    }

    // If we get here, everything succeeded, so commit the transaction
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(201).json({
      message: 'Product created successfully',
      data: { id: productId }
    });

  } catch (err) {
    // Rollback on any error
    await new Promise((resolve) => {
      db.run('ROLLBACK', resolve);
    });
    
    // Send appropriate error message
    if (err.message.includes('already exists')) {
      res.status(409).json({ error: err.message });
    } else if (err.message.includes('Invalid attribute')) {
      res.status(400).json({ error: err.message });
    } else if (err.message.includes('Duplicate attribute')) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router; 
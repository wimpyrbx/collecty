const express = require('express');
const router = express.Router();
const db = require('../../db');

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

    const result = await new Promise((resolve, reject) => {
      const sql = `INSERT INTO products (
        title,
        product_group_id,
        product_type_id,
        region_id,
        rating_id,
        image_url,
        release_year,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const params = [
        title,
        product_group_id,
        product_type_id,
        region_id,
        rating_id || null,
        image_url || null,
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

    if (attributes && Object.keys(attributes).length > 0) {
      for (const [attributeId, value] of Object.entries(attributes)) {
        try {
          await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES (?, ?, ?)';
            const params = [productId, attributeId, value];
            
            db.run(sql, params, function(err) {
              if (err) reject(err);
              else resolve();
            });
          });
        } catch (err) {
          throw new Error(`Failed to insert attribute ${attributeId}: ${err.message}`);
        }
      }
    }

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
    await new Promise((resolve) => {
      db.run('ROLLBACK', resolve);
    });
    
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
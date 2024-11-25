const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
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
    is_active
  } = req.body;

  console.log('=== PUT /products/:id ===');
  console.log('Product ID:', productId);
  console.log('Request Body:', req.body);

  const sql = `
    UPDATE products 
    SET 
      title = ?,
      product_group_id = ?,
      product_type_id = ?,
      region_id = ?,
      rating_id = ?,
      image_url = ?,
      release_year = ?,
      description = ?,
      is_active = ?
    WHERE id = ?
  `;
  
  const params = [
    title,
    product_group_id,
    product_type_id,
    region_id,
    rating_id || null,
    image_url || null,
    release_year || null,
    description || null,
    is_active !== undefined ? is_active : 1,
    productId
  ];

  console.log('=== Update SQL ===');
  console.log('SQL:', sql);
  console.log('Parameters:', params);

  db.run(sql, params, function(err) {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log('Update Result:', {
      changes: this.changes,
      lastID: this.lastID
    });

    // Return the updated product data
    db.get(
      'SELECT * FROM products WHERE id = ?',
      [productId],
      (err, row) => {
        if (err) {
          console.error('Select error:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({
          message: 'Product updated successfully',
          data: row
        });
      }
    );
  });
});

module.exports = router; 
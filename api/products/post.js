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
    developer,
    publisher,
    release_year,
    genre,
    description,
    is_active
  } = req.body;

  // Validate required fields
  if (!title || !product_group_id || !product_type_id || !region_id) {
    return res.status(400).json({
      error: 'Missing required fields: title, product_group_id, product_type_id, and region_id are required'
    });
  }

  try {
    const result = await db.run(
      `INSERT INTO products (
        title,
        product_group_id,
        product_type_id,
        region_id,
        rating_id,
        image_url,
        developer,
        publisher,
        release_year,
        genre,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        product_group_id,
        product_type_id,
        region_id,
        rating_id || null,
        image_url || null,
        developer || null,
        publisher || null,
        release_year || null,
        genre || null,
        description || null,
        is_active !== undefined ? is_active : 1
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      data: { id: result.lastID }
    });
  } catch (err) {
    console.error('Failed to create product:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
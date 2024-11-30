const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
  const { sortOrder = 'asc' } = req.query;

  try {
    const sql = `
      SELECT 
        r.*,
        rg.name as rating_group_name,
        CASE 
          WHEN rg.name IS NOT NULL 
          THEN '/assets/images/ratings/' || LOWER(rg.name) || '/' || LOWER(r.name) || '.webp'
          ELSE NULL 
        END as rating_image_path
      FROM ratings r
      LEFT JOIN rating_groups rg ON r.rating_group_id = rg.id
      WHERE r.is_active = 1 
      ORDER BY r.name ${sortOrder.toUpperCase()}
    `;

    const results = await db.allAsync(sql);
    res.json({
      message: 'success',
      data: results
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 
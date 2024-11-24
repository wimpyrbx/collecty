const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
  const { sortOrder = 'asc' } = req.query;

  try {
    const sql = `
      SELECT * FROM product_groups 
      WHERE is_active = 1 
      ORDER BY name ${sortOrder.toUpperCase()}
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
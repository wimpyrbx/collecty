const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
  const { sortOrder = 'asc' } = req.query;

  try {
    const sql = `
      SELECT 
        id,
        name,
        description,
        is_active,
        '/assets/images/regions/' || LOWER(REPLACE(name, '-', '_')) || '.webp' as image_url
      FROM regions 
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

router.get('/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM regions WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
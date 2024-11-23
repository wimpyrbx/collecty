const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/:id/extended', (req, res) => {
  const id = req.params.id;
  
  const sql = `
    SELECT 
      r.*,
      GROUP_CONCAT(DISTINCT rg.name) as rating_groups,
      GROUP_CONCAT(DISTINCT p.title) as products
    FROM regions r
    LEFT JOIN rating_groups rg ON rg.region_id = r.id
    LEFT JOIN products p ON p.region_id = r.id
    WHERE r.id = ?
    GROUP BY r.id`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }

    // Transform arrays
    row.rating_groups = row.rating_groups ? row.rating_groups.split(',') : [];
    row.products = row.products ? row.products.split(',') : [];

    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
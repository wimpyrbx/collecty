const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/:id/extended', (req, res) => {
  const id = req.params.id;
  
  const sql = `
    SELECT 
      rt.*,
      rg.name as rating_group_name,
      r.name as region_name,
      GROUP_CONCAT(DISTINCT p.title) as products
    FROM ratings rt
    LEFT JOIN rating_groups rg ON rt.rating_group_id = rg.id
    LEFT JOIN regions r ON rg.region_id = r.id
    LEFT JOIN products p ON p.rating_id = rt.id
    WHERE rt.id = ?
    GROUP BY rt.id`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    // Transform arrays
    row.products = row.products ? row.products.split(',') : [];

    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
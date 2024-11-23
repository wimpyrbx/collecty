const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/:id/extended', (req, res) => {
  const id = req.params.id;
  
  const sql = `
    SELECT 
      rg.*,
      r.name as region_name,
      GROUP_CONCAT(DISTINCT rt.name) as ratings,
      GROUP_CONCAT(DISTINCT p.title) as products
    FROM rating_groups rg
    LEFT JOIN regions r ON rg.region_id = r.id
    LEFT JOIN ratings rt ON rt.rating_group_id = rg.id
    LEFT JOIN products p ON p.rating_id = rt.id
    WHERE rg.id = ?
    GROUP BY rg.id`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Rating group not found' });
      return;
    }

    // Transform arrays
    row.ratings = row.ratings ? row.ratings.split(',') : [];
    row.products = row.products ? row.products.split(',') : [];

    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
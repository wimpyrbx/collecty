const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { groupId, typeId, regionId, ratingId, sortOrder = 'asc' } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (groupId) {
    sql += ' AND product_group_id = ?';
    params.push(groupId);
  }

  if (typeId) {
    sql += ' AND product_type_id = ?';
    params.push(typeId);
  }

  if (regionId) {
    sql += ' AND region_id = ?';
    params.push(regionId);
  }

  if (ratingId) {
    sql += ' AND rating_id = ?';
    params.push(ratingId);
  }

  sql += ` ORDER BY title ${sortOrder.toUpperCase()}`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
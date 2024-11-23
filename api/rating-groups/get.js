const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { regionId, sortOrder = 'asc' } = req.query;
  let sql = 'SELECT * FROM rating_groups WHERE 1=1';
  const params = [];

  if (regionId) {
    sql += ' AND region_id = ?';
    params.push(regionId);
  }

  sql += ` ORDER BY name ${sortOrder.toUpperCase()}`;

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
  
  db.get('SELECT * FROM rating_groups WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Rating group not found' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
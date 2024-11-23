const express = require('express');
const router = express.Router();
const db = require('../../db'); // Assuming you have a db.js file to handle database connections

router.get('/', (req, res) => {
  const { sortOrder = 'asc' } = req.query;
  const sql = `SELECT * FROM product_groups ORDER BY name ${sortOrder.toUpperCase()}`;

  db.all(sql, [], (err, rows) => {
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
  
  db.get('SELECT * FROM product_groups WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product group not found' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { sortOrder = 'asc' } = req.query;
  const sql = `SELECT * FROM product_types ORDER BY name ${sortOrder.toUpperCase()}`;

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
  
  db.get('SELECT * FROM product_types WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product type not found' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
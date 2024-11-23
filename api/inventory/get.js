const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { productId, isActive, barcode } = req.query;
  let sql = 'SELECT * FROM inventory WHERE 1=1';
  const params = [];

  if (productId) {
    sql += ' AND product_id = ?';
    params.push(productId);
  }

  if (isActive !== undefined) {
    sql += ' AND is_active = ?';
    params.push(isActive);
  }

  if (barcode) {
    sql += ' AND barcode = ?';
    params.push(barcode);
  }

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
  
  db.get('SELECT * FROM inventory WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
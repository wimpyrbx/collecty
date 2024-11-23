const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { productId, isActive } = req.query;
  let sql = 'SELECT * FROM pricecharting_prices WHERE 1=1';
  const params = [];

  if (productId) {
    sql += ' AND product_id = ?';
    params.push(productId);
  }

  if (isActive !== undefined) {
    sql += ' AND is_active = ?';
    params.push(isActive);
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

module.exports = router; 
const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { productId, attributeId } = req.query;
  let sql = 'SELECT * FROM product_attribute_values WHERE 1=1';
  const params = [];

  if (productId) {
    sql += ' AND product_id = ?';
    params.push(productId);
  }

  if (attributeId) {
    sql += ' AND attribute_id = ?';
    params.push(attributeId);
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
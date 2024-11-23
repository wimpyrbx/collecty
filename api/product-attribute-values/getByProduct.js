const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/product/:productId', (req, res) => {
  const productId = req.params.productId;
  
  db.all(
    'SELECT * FROM product_attribute_values WHERE product_id = ?',
    [productId],
    (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      });
    }
  );
});

module.exports = router; 
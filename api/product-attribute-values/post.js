const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  const { product_id, attribute_id, value } = req.body;
  const sql = 'INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES (?, ?, ?)';
  const params = [product_id, attribute_id, value];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, product_id, attribute_id, value },
    });
  });
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/attribute/:attributeId', (req, res) => {
  const attributeId = req.params.attributeId;
  
  db.all(
    'SELECT * FROM product_attribute_values WHERE attribute_id = ?',
    [attributeId],
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
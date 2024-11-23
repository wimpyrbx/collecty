const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/type/:typeId', (req, res) => {
  const typeId = req.params.typeId;
  
  db.all(
    'SELECT * FROM products WHERE product_type_id = ?',
    [typeId],
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
const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const { product_id, barcode, is_active } = req.body;
  const sql = 'UPDATE inventory SET product_id = ?, barcode = ?, is_active = ? WHERE id = ?';
  const params = [product_id, barcode, is_active, req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: req.params.id, product_id, barcode, is_active },
    });
  });
});

module.exports = router; 
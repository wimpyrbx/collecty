const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const { product_id, loose_usd, cib_usd, new_usd } = req.body;
  const sql = 'UPDATE pricecharting_prices SET product_id = ?, loose_usd = ?, cib_usd = ?, new_usd = ? WHERE id = ?';
  const params = [product_id, loose_usd, cib_usd, new_usd, req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: req.params.id, product_id, loose_usd, cib_usd, new_usd },
    });
  });
});

module.exports = router; 
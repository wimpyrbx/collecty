const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const { inventory_id, attribute_id, value } = req.body;
  const sql = 'UPDATE inventory_attribute_values SET inventory_id = ?, attribute_id = ?, value = ? WHERE id = ?';
  const params = [inventory_id, attribute_id, value, req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: req.params.id, inventory_id, attribute_id, value },
    });
  });
});

module.exports = router; 
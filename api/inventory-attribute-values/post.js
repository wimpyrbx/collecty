const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  const { inventory_id, attribute_id, value } = req.body;
  const sql = 'INSERT INTO inventory_attribute_values (inventory_id, attribute_id, value) VALUES (?, ?, ?)';
  const params = [inventory_id, attribute_id, value];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, inventory_id, attribute_id, value },
    });
  });
});

module.exports = router; 
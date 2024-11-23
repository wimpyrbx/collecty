const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/inventory/:inventoryId', (req, res) => {
  const inventoryId = req.params.inventoryId;
  
  db.all(
    'SELECT * FROM inventory_attribute_values WHERE inventory_id = ?',
    [inventoryId],
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
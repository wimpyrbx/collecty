const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { inventoryId, attributeId } = req.query;
  let sql = 'SELECT * FROM inventory_attribute_values WHERE 1=1';
  const params = [];

  if (inventoryId) {
    sql += ' AND inventory_id = ?';
    params.push(inventoryId);
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
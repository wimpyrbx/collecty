const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM inventory_attribute_values WHERE id = ?';
  const params = [req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'deleted', changes: this.changes });
  });
});

module.exports = router; 
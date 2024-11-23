const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const { name, description, is_active } = req.body;
  const sql = 'UPDATE product_groups SET name = ?, description = ?, is_active = ? WHERE id = ?';
  const params = [name, description, is_active, req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: req.params.id, name, description, is_active },
    });
  });
});

module.exports = router; 
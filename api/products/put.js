const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const { title, description, is_active } = req.body;
  const sql = 'UPDATE products SET title = ?, description = ?, is_active = ? WHERE id = ?';
  const params = [title, description, is_active, req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: req.params.id, title, description, is_active },
    });
  });
});

module.exports = router; 
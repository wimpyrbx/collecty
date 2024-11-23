const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  const { name, description, is_active } = req.body;
  const sql = 'INSERT INTO product_groups (name, description, is_active) VALUES (?, ?, ?)';
  const params = [name, description, is_active || 1];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, name, description, is_active },
    });
  });
});

module.exports = router; 
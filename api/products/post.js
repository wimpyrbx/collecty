const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  const { title, description, is_active } = req.body;
  const sql = 'INSERT INTO products (title, description, is_active) VALUES (?, ?, ?)';
  const params = [title, description, is_active || 1];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, title, description, is_active },
    });
  });
});

module.exports = router; 
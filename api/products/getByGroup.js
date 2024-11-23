const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/group/:groupId', (req, res) => {
  const groupId = req.params.groupId;
  
  db.all(
    'SELECT * FROM products WHERE product_group_id = ?',
    [groupId],
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
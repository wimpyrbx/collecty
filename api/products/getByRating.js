const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/rating/:ratingId', (req, res) => {
  const ratingId = req.params.ratingId;
  
  db.all(
    'SELECT * FROM products WHERE rating_id = ?',
    [ratingId],
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
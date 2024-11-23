const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/group/:ratingGroupId', (req, res) => {
  const ratingGroupId = req.params.ratingGroupId;
  
  db.all(
    'SELECT * FROM ratings WHERE rating_group_id = ?',
    [ratingGroupId],
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
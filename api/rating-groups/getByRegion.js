const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/region/:regionId', (req, res) => {
  const regionId = req.params.regionId;
  
  db.all(
    'SELECT * FROM rating_groups WHERE region_id = ?',
    [regionId],
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
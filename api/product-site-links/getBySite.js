const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/site/:siteId', (req, res) => {
  const siteId = req.params.siteId;
  
  db.all(
    'SELECT * FROM product_site_links WHERE site_id = ?',
    [siteId],
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
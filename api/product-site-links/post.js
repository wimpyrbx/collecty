const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  const { product_id, site_id, url_path, is_active } = req.body;
  const sql = 'INSERT INTO product_site_links (product_id, site_id, url_path, is_active) VALUES (?, ?, ?, ?)';
  const params = [product_id, site_id, url_path, is_active || 1];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id: this.lastID, product_id, site_id, url_path, is_active },
    });
  });
});

module.exports = router; 
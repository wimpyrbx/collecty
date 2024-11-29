const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/:id', (req, res) => {
  const regionId = req.params.id;

  // Check both rating_groups and products
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM rating_groups WHERE region_id = ?) as rating_groups_count,
      (SELECT COUNT(*) FROM products WHERE region_id = ?) as products_count
  `;

  db.get(sql, [regionId, regionId], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (row.rating_groups_count > 0) {
      res.status(409).json({ 
        error: 'Cannot delete region as it is in use by one or more rating groups' 
      });
      return;
    }

    if (row.products_count > 0) {
      res.status(409).json({ 
        error: 'Cannot delete region as it is in use by one or more products' 
      });
      return;
    }

    // If not in use, proceed with deletion
    db.run('DELETE FROM regions WHERE id = ?', [regionId], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Region not found' });
        return;
      }

      res.json({
        message: 'success',
        data: { id: regionId }
      });
    });
  });
});

module.exports = router; 
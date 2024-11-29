const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/:id', (req, res) => {
  const groupId = req.params.id;

  // Check if group is in use by any products
  const sql = `
    SELECT EXISTS(
      SELECT 1 FROM products WHERE product_group_id = ?
    ) as in_use
  `;

  db.get(sql, [groupId], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (row.in_use) {
      res.status(409).json({ 
        error: 'Cannot delete product group as it is in use by one or more products'
      });
      return;
    }

    // If not in use, proceed with deletion
    db.run('DELETE FROM product_groups WHERE id = ?', [groupId], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Product group not found' });
        return;
      }

      res.json({
        message: 'success',
        data: { id: groupId }
      });
    });
  });
});

module.exports = router; 
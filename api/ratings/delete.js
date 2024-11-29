const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/:id', (req, res) => {
  const ratingId = req.params.id;

  // Check if rating is in use by any products
  const sql = `
    SELECT EXISTS(
      SELECT 1 
      FROM products p
      JOIN ratings r ON p.rating_id = r.id
      WHERE r.id = ? AND r.rating_group_id = (
        SELECT rating_group_id FROM ratings WHERE id = ?
      )
    ) as in_use
  `;

  db.get(sql, [ratingId, ratingId], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (row.in_use) {
      res.status(409).json({ 
        error: 'Cannot delete rating as it is in use by one or more products'
      });
      return;
    }

    // If not in use, proceed with deletion
    db.run('DELETE FROM ratings WHERE id = ?', [ratingId], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Rating not found' });
        return;
      }

      res.json({
        message: 'success',
        data: { id: ratingId }
      });
    });
  });
});

module.exports = router; 
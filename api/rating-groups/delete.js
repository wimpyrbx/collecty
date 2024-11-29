const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/:id', (req, res) => {
  const groupId = req.params.id;

  // Check for ratings using this group
  const sql = `
    SELECT COUNT(*) as ratings_count 
    FROM ratings 
    WHERE rating_group_id = ?
  `;

  db.get(sql, [groupId], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (row.ratings_count > 0) {
      res.status(409).json({ 
        error: 'Cannot delete rating group as it is in use by one or more ratings' 
      });
      return;
    }

    // If not in use, proceed with deletion
    db.run('DELETE FROM rating_groups WHERE id = ?', [groupId], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Rating group not found' });
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
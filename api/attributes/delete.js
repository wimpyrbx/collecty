const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/:id', (req, res) => {
  const attributeId = req.params.id;

  // First check if attribute is in use
  db.get(
    'SELECT COUNT(*) as count FROM product_attribute_values WHERE attribute_id = ?',
    [attributeId],
    (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (row.count > 0) {
        res.status(409).json({ 
          error: 'Cannot delete attribute as it is in use by one or more products' 
        });
        return;
      }

      // If not in use, proceed with deletion
      db.run('DELETE FROM attributes WHERE id = ?', [attributeId], function(err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        if (this.changes === 0) {
          res.status(404).json({ error: 'Attribute not found' });
          return;
        }

        res.json({
          message: 'success',
          data: { id: attributeId }
        });
      });
    }
  );
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const attributeId = req.params.id;
  const {
    name,
    ui_name,
    type,
    scope,
    is_required,
    use_image,
    allowed_values,
    default_value,
    product_group_ids,
    product_type_ids
  } = req.body;

  // First check if attribute exists
  db.get('SELECT id FROM attributes WHERE id = ?', [attributeId], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Attribute not found' });
      return;
    }

    const sql = `
      UPDATE attributes SET
        name = ?,
        ui_name = ?,
        type = ?,
        scope = ?,
        is_required = ?,
        use_image = ?,
        allowed_values = ?,
        default_value = ?,
        product_group_ids = ?,
        product_type_ids = ?
      WHERE id = ?
    `;

    // Convert arrays to JSON strings if they exist, otherwise null
    const groupIds = product_group_ids ? JSON.stringify(product_group_ids) : null;
    const typeIds = product_type_ids ? JSON.stringify(product_type_ids) : null;

    const params = [
      name,
      ui_name,
      type,
      scope || 'product',
      is_required ? 1 : 0,
      use_image ? 1 : 0,
      allowed_values || '',
      default_value || '',
      groupIds,
      typeIds,
      attributeId
    ];

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: {
          id: attributeId,
          name,
          ui_name,
          type,
          scope,
          is_required,
          use_image,
          allowed_values,
          default_value,
          product_group_ids: groupIds,
          product_type_ids: typeIds
        }
      });
    });
  });
});

module.exports = router; 
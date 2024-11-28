const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  console.log('posting attribute');
  console.log(req.body);
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

  const sql = `
    INSERT INTO attributes (
      name,
      ui_name,
      type,
      scope,
      is_required,
      use_image,
      allowed_values,
      default_value,
      product_group_ids,
      product_type_ids,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

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
    typeIds
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
        id: this.lastID,
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

module.exports = router; 
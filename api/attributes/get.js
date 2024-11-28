const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { type, scope, isActive, productTypeId, productGroupId, sortOrder = 'asc' } = req.query;
  let sql = 'SELECT * FROM attributes WHERE 1=1';
  const params = [];

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  if (scope) {
    sql += ' AND scope = ?';
    params.push(scope);
  }

  if (isActive !== undefined) {
    sql += ' AND is_active = ?';
    params.push(isActive);
  }

  if (productTypeId) {
    sql += " AND json_array_length(product_type_ids) > 0 AND product_type_ids LIKE '%' || ? || '%'";
    params.push(productTypeId);
  }

  if (productGroupId) {
    sql += " AND json_array_length(product_group_ids) > 0 AND product_group_ids LIKE '%' || ? || '%'";
    params.push(productGroupId);
  }

  sql += ` ORDER BY name ${sortOrder.toUpperCase()}`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM attributes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Attribute not found' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
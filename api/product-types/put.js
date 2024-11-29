const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const { name, description, is_active } = req.body;
  const typeId = req.params.id;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const sql = `
    UPDATE product_types 
    SET name = ?, 
        description = ?, 
        is_active = ?
    WHERE id = ?
  `;
  const params = [
    name,
    description || null,
    is_active !== undefined ? is_active : 1,
    typeId
  ];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Product type not found' });
      return;
    }

    res.json({
      message: 'success',
      data: { 
        id: typeId, 
        name, 
        description, 
        is_active 
      }
    });
  });
});

module.exports = router; 
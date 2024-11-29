const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const { 
    name, 
    rating_group_id,
    minimum_age,
    description,
    is_active 
  } = req.body;

  if (!name) {
    return res.status(400).json({ 
      error: 'Name is required' 
    });
  }

  const sql = `
    UPDATE ratings 
    SET name = ?,
        rating_group_id = ?,
        minimum_age = ?,
        description = ?,
        is_active = ?
    WHERE id = ?
  `;

  const params = [
    name,
    rating_group_id,
    minimum_age || null,
    description || null,
    is_active !== undefined ? is_active : 1,
    req.params.id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message, sql: sql, params: params });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    res.json({
      message: 'success',
      data: { 
        id: req.params.id, 
        name,
        rating_group_id,
        minimum_age,
        description,
        is_active
      }
    });
  });
});

module.exports = router; 
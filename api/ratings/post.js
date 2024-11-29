const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  const { 
    name, 
    rating_group_id, 
    minimum_age,
    description 
  } = req.body;
  
  if (!name || !rating_group_id) {
    return res.status(400).json({ 
      error: 'Name and rating_group_id are required' 
    });
  }

  const sql = `
    INSERT INTO ratings (
      name, 
      rating_group_id, 
      minimum_age,
      description, 
      is_active
    ) VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    name, 
    rating_group_id, 
    minimum_age || null,
    description || null, 
    1
  ];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { 
        id: this.lastID, 
        name,
        rating_group_id,
        minimum_age,
        description,
        is_active: 1 
      }
    });
  });
});

module.exports = router; 
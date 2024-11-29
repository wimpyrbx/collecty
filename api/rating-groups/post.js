const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/', (req, res) => {
  const { name, region_id, description } = req.body;
  
  if (!name || !region_id) {
    return res.status(400).json({ 
      error: 'Name and region_id are required' 
    });
  }

  const sql = `
    INSERT INTO rating_groups (
      name, 
      region_id, 
      description, 
      is_active
    ) VALUES (?, ?, ?, ?)
  `;
  const params = [name, region_id, description || null, 1];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message, sql: sql, params: params });
      return;
    }
    res.json({
      message: 'success',
      data: { 
        id: this.lastID, 
        name, 
        region_id, 
        description, 
        is_active: 1 
      }
    });
  });
});

module.exports = router; 
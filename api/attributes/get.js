const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
  const { sortOrder = 'asc', is_active, scope } = req.query;
  
  let sql = 'SELECT * FROM attributes WHERE 1=1';
  const params = [];

  if (is_active !== undefined) {
    sql += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  if (scope) {
    sql += ' AND scope = ?';
    params.push(scope);
  }
  
  sql += ` ORDER BY name ${sortOrder.toUpperCase()}`;

  //console.log('Attributes Query:', sql, params);  // Debug log

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    //console.log(`Found ${rows.length} attributes`);  // Debug log
    res.json({
      message: 'success',
      data: rows
    });
  });
});

module.exports = router; 
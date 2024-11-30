const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
  const { sortOrder = 'asc', is_active, scope } = req.query;
  
  try {
    let sql = `
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT pav.product_id) as product_ids,
        GROUP_CONCAT(DISTINCT iav.inventory_id) as inventory_ids
      FROM attributes a
      LEFT JOIN product_attribute_values pav ON a.id = pav.attribute_id
      LEFT JOIN inventory_attribute_values iav ON a.id = iav.attribute_id
      WHERE 1=1
    `;
    
    const params = [];

    if (is_active !== undefined) {
      sql += ' AND a.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    if (scope) {
      sql += ' AND a.scope = ?';
      params.push(scope);
    }
    
    sql += ' GROUP BY a.id';
    sql += ` ORDER BY a.name ${sortOrder.toUpperCase()}`;

    const results = await db.allAsync(sql, params);

    if (!results || results.length === 0) {
      return res.json({
        message: 'success',
        data: []
      });
    }

    // Transform results to include parsed arrays
    const transformedResults = results.map(attr => ({
      ...attr,
      product_group_ids: attr.product_group_ids ? JSON.parse(attr.product_group_ids) : [],
      product_type_ids: attr.product_type_ids ? JSON.parse(attr.product_type_ids) : [],
      product_ids: attr.product_ids ? attr.product_ids.split(',').map(Number) : [],
      inventory_ids: attr.inventory_ids ? attr.inventory_ids.split(',').map(Number) : []
    }));

    res.json({
      message: 'success',
      data: transformedResults
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 
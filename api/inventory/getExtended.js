const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/:id/extended', (req, res) => {
  const id = req.params.id;
  
  const sql = `
    SELECT 
      i.*,
      p.title as product_title,
      p.image_url as product_image_url,
      pg.name as product_group_name,
      pt.name as product_type_name,
      r.name as region_name,
      rt.name as rating_name,
      rtg.name as rating_group_name,
      GROUP_CONCAT(DISTINCT iav.value || '::' || a.name) as attribute_values
    FROM inventory i
    LEFT JOIN products p ON i.product_id = p.id
    LEFT JOIN product_groups pg ON p.product_group_id = pg.id
    LEFT JOIN product_types pt ON p.product_type_id = pt.id
    LEFT JOIN regions r ON p.region_id = r.id
    LEFT JOIN ratings rt ON p.rating_id = rt.id
    LEFT JOIN rating_groups rtg ON rt.rating_group_id = rtg.id
    LEFT JOIN inventory_attribute_values iav ON i.id = iav.inventory_id
    LEFT JOIN attributes a ON iav.attribute_id = a.id
    WHERE i.id = ?
    GROUP BY i.id`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    // Transform attribute_values string into object
    const attributes = {};
    if (row.attribute_values) {
      row.attribute_values.split(',').forEach(pair => {
        const [value, name] = pair.split('::');
        attributes[name] = value;
      });
    }
    row.attributes = attributes;
    delete row.attribute_values;

    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
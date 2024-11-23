const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/:id/extended', (req, res) => {
  const id = req.params.id;
  
  const sql = `
    SELECT 
      p.*,
      pg.name as product_group_name,
      pt.name as product_type_name,
      r.name as region_name,
      rt.name as rating_name,
      rtg.name as rating_group_name,
      GROUP_CONCAT(DISTINCT pav.value || '::' || a.name) as attribute_values,
      GROUP_CONCAT(DISTINCT ps.name || '::' || psl.url_path) as site_links,
      pp.loose_usd, pp.cib_usd, pp.new_usd
    FROM products p
    LEFT JOIN product_groups pg ON p.product_group_id = pg.id
    LEFT JOIN product_types pt ON p.product_type_id = pt.id
    LEFT JOIN regions r ON p.region_id = r.id
    LEFT JOIN ratings rt ON p.rating_id = rt.id
    LEFT JOIN rating_groups rtg ON rt.rating_group_id = rtg.id
    LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
    LEFT JOIN attributes a ON pav.attribute_id = a.id
    LEFT JOIN product_site_links psl ON p.id = psl.product_id
    LEFT JOIN product_sites ps ON psl.site_id = ps.id
    LEFT JOIN pricecharting_prices pp ON p.id = pp.product_id
    WHERE p.id = ?
    GROUP BY p.id`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Transform attribute_values and site_links strings into objects
    const attributes = {};
    if (row.attribute_values) {
      row.attribute_values.split(',').forEach(pair => {
        const [value, name] = pair.split('::');
        attributes[name] = value;
      });
    }
    row.attributes = attributes;
    delete row.attribute_values;

    const siteLinks = {};
    if (row.site_links) {
      row.site_links.split(',').forEach(pair => {
        const [site, url] = pair.split('::');
        siteLinks[site] = url;
      });
    }
    row.siteLinks = siteLinks;
    delete row.site_links;

    res.json({
      message: 'success',
      data: row
    });
  });
});

module.exports = router; 
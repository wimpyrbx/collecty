const express = require('express');
const router = express.Router();
const db = require('../../db');

// GET /api/products - List all products (basic or extended)
router.get('/', async (req, res) => {
  const { 
    extended,
    groupId, 
    typeId, 
    regionId, 
    sortField = 'title', 
    sortOrder = 'asc',
    page = 1,
    limit = 10
  } = req.query;

  try {
    let sql;
    const params = [];

    if (extended === 'true') {
      sql = `
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
        WHERE 1=1`;
    } else {
      sql = 'SELECT * FROM products WHERE 1=1';
    }

    // Add filters
    if (groupId) {
      sql += ' AND p.product_group_id = ?';
      params.push(groupId);
    }
    if (typeId) {
      sql += ' AND p.product_type_id = ?';
      params.push(typeId);
    }
    if (regionId) {
      sql += ' AND p.region_id = ?';
      params.push(regionId);
    }

    // Add GROUP BY if extended
    if (extended === 'true') {
      sql += ' GROUP BY p.id';
    }

    // Add sorting
    const validSortFields = ['id', 'title', 'developer', 'publisher', 'release_year'];
    if (validSortFields.includes(sortField)) {
      sql += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const results = await db.all(sql, params);

    if (extended === 'true') {
      // Transform extended results
      const transformedResults = results.map(row => {
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

        return row;
      });

      res.json({
        message: 'success',
        data: transformedResults
      });
    } else {
      res.json({
        message: 'success',
        data: results
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/products/:id - Get a single product (basic or extended)
router.get('/:id', async (req, res) => {
  const { extended } = req.query;
  const { id } = req.params;

  try {
    let sql;
    const params = [id];

    if (extended === 'true') {
      sql = `
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
    } else {
      sql = 'SELECT * FROM products WHERE id = ?';
    }

    const result = await db.get(sql, params);

    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (extended === 'true') {
      // Transform extended result
      const attributes = {};
      if (result.attribute_values) {
        result.attribute_values.split(',').forEach(pair => {
          const [value, name] = pair.split('::');
          attributes[name] = value;
        });
      }
      result.attributes = attributes;
      delete result.attribute_values;

      const siteLinks = {};
      if (result.site_links) {
        result.site_links.split(',').forEach(pair => {
          const [site, url] = pair.split('::');
          siteLinks[site] = url;
        });
      }
      result.siteLinks = siteLinks;
      delete result.site_links;
    }

    res.json({
      message: 'success',
      data: result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
  // ... implementation ...
});

// PUT /api/products/:id - Update a product
router.put('/:id', async (req, res) => {
  // ... implementation ...
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  // ... implementation ...
});

module.exports = router; 
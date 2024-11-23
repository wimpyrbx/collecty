const express = require('express');
const router = express.Router();
const db = require('../../db');

// Get attribute value distribution
router.get('/attribute-distribution', (req, res) => {
  const { attributeId, productTypeId, productGroupId } = req.query;
  const sql = `
    SELECT 
      a.name as attribute_name,
      pav.value,
      COUNT(*) as count
    FROM product_attribute_values pav
    JOIN attributes a ON a.id = pav.attribute_id
    JOIN products p ON p.id = pav.product_id
    WHERE 1=1
    ${attributeId ? 'AND a.id = ?' : ''}
    ${productTypeId ? 'AND p.product_type_id = ?' : ''}
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    GROUP BY a.name, pav.value
    ORDER BY a.name, count DESC
  `;
  
  const params = [];
  if (attributeId) params.push(attributeId);
  if (productTypeId) params.push(productTypeId);
  if (productGroupId) params.push(productGroupId);

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

// Get completeness stats (CIB status)
router.get('/completeness', (req, res) => {
  const { productTypeId, productGroupId } = req.query;
  const sql = `
    SELECT 
      CASE 
        WHEN box.value IS NULL AND manual.value IS NULL AND disc.value IS NULL THEN 'Unknown'
        WHEN box.value = 'Missing' OR manual.value = 'Missing' OR disc.value = 'Missing' THEN 'Incomplete'
        ELSE 'Complete'
      END as status,
      COUNT(*) as count
    FROM products p
    LEFT JOIN product_attribute_values box ON box.product_id = p.id AND box.attribute_id = (SELECT id FROM attributes WHERE name = 'boxCondition')
    LEFT JOIN product_attribute_values manual ON manual.product_id = p.id AND manual.attribute_id = (SELECT id FROM attributes WHERE name = 'manualCondition')
    LEFT JOIN product_attribute_values disc ON disc.product_id = p.id AND disc.attribute_id = (SELECT id FROM attributes WHERE name = 'discCondition')
    WHERE p.product_type_id = 1  -- Assuming 1 is for Games
    ${productTypeId ? 'AND p.product_type_id = ?' : ''}
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    GROUP BY status
    ORDER BY count DESC
  `;

  const params = [];
  if (productTypeId) params.push(productTypeId);
  if (productGroupId) params.push(productGroupId);

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

// Get price analysis
router.get('/price-analysis', (req, res) => {
  const { productGroupId, productTypeId, regionId } = req.query;
  const sql = `
    SELECT 
      'Loose' as condition,
      AVG(pp.loose_usd) as avg_price_usd,
      MIN(pp.loose_usd) as min_price_usd,
      MAX(pp.loose_usd) as max_price_usd,
      COUNT(*) as count
    FROM pricecharting_prices pp
    JOIN products p ON p.id = pp.product_id
    WHERE pp.loose_usd IS NOT NULL
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    ${productTypeId ? 'AND p.product_type_id = ?' : ''}
    ${regionId ? 'AND p.region_id = ?' : ''}
    UNION ALL
    SELECT 
      'CIB' as condition,
      AVG(pp.cib_usd) as avg_price_usd,
      MIN(pp.cib_usd) as min_price_usd,
      MAX(pp.cib_usd) as max_price_usd,
      COUNT(*) as count
    FROM pricecharting_prices pp
    JOIN products p ON p.id = pp.product_id
    WHERE pp.cib_usd IS NOT NULL
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    ${productTypeId ? 'AND p.product_type_id = ?' : ''}
    ${regionId ? 'AND p.region_id = ?' : ''}
    UNION ALL
    SELECT 
      'New' as condition,
      AVG(pp.new_usd) as avg_price_usd,
      MIN(pp.new_usd) as min_price_usd,
      MAX(pp.new_usd) as max_price_usd,
      COUNT(*) as count
    FROM pricecharting_prices pp
    JOIN products p ON p.id = pp.product_id
    WHERE pp.new_usd IS NOT NULL
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    ${productTypeId ? 'AND p.product_type_id = ?' : ''}
    ${regionId ? 'AND p.region_id = ?' : ''}
  `;

  const params = [];
  if (productGroupId) {
    params.push(productGroupId, productGroupId, productGroupId);
  }
  if (productTypeId) {
    params.push(productTypeId, productTypeId, productTypeId);
  }
  if (regionId) {
    params.push(regionId, regionId, regionId);
  }

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

// Get collection completeness
router.get('/collection-completeness', (req, res) => {
  const { productGroupId, regionId } = req.query;
  const sql = `
    SELECT 
      p.product_group_id,
      pg.name as group_name,
      COUNT(DISTINCT p.id) as total_products,
      COUNT(DISTINCT i.product_id) as owned_products,
      ROUND(CAST(COUNT(DISTINCT i.product_id) AS FLOAT) / COUNT(DISTINCT p.id) * 100, 2) as completion_percentage
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    JOIN product_groups pg ON pg.id = p.product_group_id
    WHERE 1=1
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    ${regionId ? 'AND p.region_id = ?' : ''}
    GROUP BY p.product_group_id, pg.name
    ORDER BY pg.name
  `;

  const params = [];
  if (productGroupId) params.push(productGroupId);
  if (regionId) params.push(regionId);

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

// Get inventory health
router.get('/inventory-health', (req, res) => {
  const { productGroupId, productTypeId } = req.query;
  const sql = `
    WITH required_attributes AS (
      SELECT p.id as product_id, COUNT(DISTINCT a.id) as required_count
      FROM products p
      CROSS JOIN attributes a
      WHERE a.is_required = 1 
      AND a.scope = 'product'
      ${productGroupId ? 'AND p.product_group_id = ?' : ''}
      ${productTypeId ? 'AND p.product_type_id = ?' : ''}
      GROUP BY p.id
    ),
    actual_attributes AS (
      SELECT p.id as product_id, COUNT(DISTINCT pav.attribute_id) as actual_count
      FROM products p
      LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
      WHERE 1=1
      ${productGroupId ? 'AND p.product_group_id = ?' : ''}
      ${productTypeId ? 'AND p.product_type_id = ?' : ''}
      GROUP BY p.id
    )
    SELECT 
      p.id,
      p.title,
      CASE 
        WHEN ra.required_count > aa.actual_count THEN 'Missing Required Attributes'
        WHEN pp.id IS NULL THEN 'Missing Price Data'
        ELSE 'Complete'
      END as status
    FROM products p
    JOIN required_attributes ra ON ra.product_id = p.id
    JOIN actual_attributes aa ON aa.product_id = p.id
    LEFT JOIN pricecharting_prices pp ON pp.product_id = p.id
    WHERE 1=1
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    ${productTypeId ? 'AND p.product_type_id = ?' : ''}
    ORDER BY p.title
  `;

  const params = [];
  if (productGroupId) params.push(productGroupId, productGroupId, productGroupId);
  if (productTypeId) params.push(productTypeId, productTypeId, productTypeId);

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

// Add this endpoint
router.get('/attribute-usage', (req, res) => {
  const { scope } = req.query;
  const sql = `
    SELECT 
      a.name as attribute_name,
      a.scope,
      COUNT(DISTINCT CASE WHEN a.scope = 'product' THEN pav.product_id ELSE iav.inventory_id END) as usage_count,
      COUNT(DISTINCT CASE 
        WHEN a.scope = 'product' THEN p.product_group_id 
        ELSE ip.product_group_id 
      END) as group_count
    FROM attributes a
    LEFT JOIN product_attribute_values pav ON a.id = pav.attribute_id AND a.scope = 'product'
    LEFT JOIN inventory_attribute_values iav ON a.id = iav.attribute_id AND a.scope = 'inventory'
    LEFT JOIN products p ON pav.product_id = p.id
    LEFT JOIN inventory i ON iav.inventory_id = i.id
    LEFT JOIN products ip ON i.product_id = ip.id
    WHERE 1=1
    ${scope ? 'AND a.scope = ?' : ''}
    GROUP BY a.id, a.name, a.scope
    ORDER BY usage_count DESC
  `;

  const params = [];
  if (scope) params.push(scope);

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

// Add this endpoint
router.get('/price-ranges', (req, res) => {
  const { productGroupId, condition = 'loose_usd' } = req.query;
  const sql = `
    WITH ranges AS (
      SELECT 
        CASE 
          WHEN ${condition} < 10 THEN 'Under $10'
          WHEN ${condition} < 25 THEN '$10-$25'
          WHEN ${condition} < 50 THEN '$25-$50'
          WHEN ${condition} < 100 THEN '$50-$100'
          ELSE 'Over $100'
        END as price_range,
        COUNT(*) as count
      FROM pricecharting_prices pp
      JOIN products p ON p.id = pp.product_id
      WHERE ${condition} IS NOT NULL
      ${productGroupId ? 'AND p.product_group_id = ?' : ''}
      GROUP BY price_range
    )
    SELECT 
      price_range,
      count,
      ROUND(CAST(count AS FLOAT) / (SELECT SUM(count) FROM ranges) * 100, 2) as percentage
    FROM ranges
    ORDER BY 
      CASE price_range
        WHEN 'Under $10' THEN 1
        WHEN '$10-$25' THEN 2
        WHEN '$25-$50' THEN 3
        WHEN '$50-$100' THEN 4
        ELSE 5
      END
  `;

  const params = [];
  if (productGroupId) params.push(productGroupId);

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

// Add this endpoint
router.get('/collection-value', (req, res) => {
  const { productGroupId, regionId } = req.query;
  const sql = `
    SELECT 
      pg.name as group_name,
      COUNT(DISTINCT i.id) as owned_items,
      SUM(pp.loose_usd) as total_loose_value,
      SUM(pp.cib_usd) as total_cib_value,
      SUM(pp.new_usd) as total_new_value,
      AVG(pp.loose_usd) as avg_loose_value,
      AVG(pp.cib_usd) as avg_cib_value,
      AVG(pp.new_usd) as avg_new_value
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    JOIN product_groups pg ON pg.id = p.product_group_id
    LEFT JOIN pricecharting_prices pp ON pp.product_id = p.id
    WHERE 1=1
    ${productGroupId ? 'AND p.product_group_id = ?' : ''}
    ${regionId ? 'AND p.region_id = ?' : ''}
    GROUP BY pg.id, pg.name
    ORDER BY pg.name
  `;

  const params = [];
  if (productGroupId) params.push(productGroupId);
  if (regionId) params.push(regionId);

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

module.exports = router; 
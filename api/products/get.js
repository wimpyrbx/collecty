const express = require('express');
const router = express.Router();
const db = require('../../db');
const path = require('path');
const { getImagePaths } = require('./imageUtils');

// Helper function to get image URLs for a product
function getProductImageUrls(productId) {
  const paths = getImagePaths(productId);
  
  try {
    // Use fs.accessSync to check if files exist
    require('fs').accessSync(paths.originalPath);
    return {
      originalUrl: `/assets/images/products/original/${paths.x}/${paths.y}/${paths.filename}`,
      thumbUrl: `/assets/images/products/thumb/${paths.x}/${paths.y}/${paths.filename}`
    };
  } catch (err) {
    return { originalUrl: null, thumbUrl: null };
  }
}

// Helper function to transform product data
function transformProduct(product) {
  if (!product) return null;
  
  const { originalUrl, thumbUrl } = getProductImageUrls(product.id);
  return {
    ...product,
    productImageOriginal: originalUrl,
    productImageThumb: thumbUrl
  };
}

// GET /api/products - Get all products or a single product with optional extended info
router.get('/', async (req, res) => {
  const { 
    id,
    extended,
    groupId, 
    typeId, 
    regionId,
    search,
    sortField = 'title', 
    sortOrder = 'asc',
    page = 1,
    limit = 10
  } = req.query;

  try {
    let sql;
    const params = [];

    // Build the SQL query based on whether extended info is requested
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

      // Add search condition
      if (search) {
        sql += ' AND p.title LIKE ?';
        params.push(`%${search}%`);
      }

      // Add filters for extended query
      if (id) {
        sql += ' AND p.id = ?';
        params.push(id);
      }
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

      sql += ' GROUP BY p.id';
    } else {
      // Basic query without joins
      sql = 'SELECT * FROM products WHERE 1=1';

      // Add search condition
      if (search) {
        sql += ' AND title LIKE ?';
        params.push(`%${search}%`);
      }

      // Add filters for basic query
      if (id) {
        sql += ' AND id = ?';
        params.push(id);
      }
      if (groupId) {
        sql += ' AND product_group_id = ?';
        params.push(groupId);
      }
      if (typeId) {
        sql += ' AND product_type_id = ?';
        params.push(typeId);
      }
      if (regionId) {
        sql += ' AND region_id = ?';
        params.push(regionId);
      }
    }

    // Add sorting
    const validSortFields = ['id', 'title', 'release_year'];
    if (validSortFields.includes(sortField)) {
      const sortColumn = extended === 'true' ? `p.${sortField}` : sortField;
      sql += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;
    }

    // Add pagination only if no specific ID is requested
    if (!id) {
      const offset = (page - 1) * limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
    }

    // Execute query
    const results = await db.allAsync(sql, params);

    // Handle no results
    if (!results || (id && results.length === 0)) {
      return res.status(404).json({ 
        error: id ? 'Product not found' : 'No products found' 
      });
    }

    // Transform results if extended info was requested
    if (extended === 'true') {
      const transformRow = (row) => {
        // Transform attribute_values into object
        const attributes = {};
        if (row.attribute_values) {
          row.attribute_values.split(',').forEach(pair => {
            const [value, name] = pair.split('::');
            attributes[name] = value;
          });
        }
        row.attributes = attributes;
        delete row.attribute_values;

        // Transform site_links into object
        const siteLinks = {};
        if (row.site_links) {
          row.site_links.split(',').forEach(pair => {
            const [site, url] = pair.split('::');
            siteLinks[site] = url;
          });
        }
        row.siteLinks = siteLinks;
        delete row.site_links;

        // Add image URLs
        return transformProduct(row);
      };

      const transformedResults = id ? transformRow(results[0]) : results.map(transformRow);
      return res.json({
        message: 'success',
        data: transformedResults
      });
    }

    // Return basic results with image URLs
    const transformedResults = id ? 
      transformProduct(results[0]) : 
      results.map(product => transformProduct(product));

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
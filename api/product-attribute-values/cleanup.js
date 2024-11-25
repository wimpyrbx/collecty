const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/cleanup', async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    // First get the product's group and type
    const product = await new Promise((resolve, reject) => {
      db.get(
        'SELECT product_group_id, product_type_id FROM products WHERE id = ?',
        [productId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get valid attribute IDs for this product's group and type
    const validAttributes = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id FROM attributes 
         WHERE scope = 'product'
         AND (
           (product_group_ids IS NULL OR json_array_length(product_group_ids) = 0 OR json_extract(product_group_ids, '$[#]') = ?)
           AND
           (product_type_ids IS NULL OR json_array_length(product_type_ids) = 0 OR json_extract(product_type_ids, '$[#]') = ?)
         )`,
        [product.product_group_id, product.product_type_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const validAttributeIds = validAttributes.map(attr => attr.id);

    console.log('=== Cleanup Attributes ===');
    console.log('Product ID:', productId);
    console.log('Valid Attribute IDs:', validAttributeIds);

    // Delete any attribute values that aren't in the valid list
    const result = await new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM product_attribute_values 
         WHERE product_id = ? 
         AND attribute_id NOT IN (${validAttributeIds.join(',')})`,
        [productId],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    console.log('Cleanup Result:', { changes: result.changes });
    res.json({ 
      message: 'Cleanup successful', 
      changes: result.changes 
    });

  } catch (err) {
    console.error('Cleanup Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
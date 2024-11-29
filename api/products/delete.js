const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // First check if product exists
    const product = await db.getAsync('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Start a transaction
    await db.runAsync('BEGIN TRANSACTION');

    try {
      // First clean up attribute values
      await db.runAsync('DELETE FROM product_attribute_values WHERE product_id = ?', [productId]);
      
      // Then delete the product
      await db.runAsync('DELETE FROM products WHERE id = ?', [productId]);

      // Commit the transaction
      await db.runAsync('COMMIT');

      res.json({
        message: 'success',
        data: { id: productId }
      });
    } catch (err) {
      // If anything goes wrong, rollback the transaction
      await db.runAsync('ROLLBACK');
      throw err;
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 
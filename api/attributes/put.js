const express = require('express');
const router = express.Router();
const db = require('../../db');

router.put('/:id', (req, res) => {
  const attributeId = req.params.id;
  
  //console.log('\n=== PUT /attributes/:id ===');
  //console.log('Attribute ID:', attributeId);
  //console.log('Request Body:', req.body);
  
  const {
    name,
    ui_name,
    type,
    scope,
    is_required,
    use_image,
    allowed_values,
    default_value,
    product_group_ids,
    product_type_ids,
    is_active
  } = req.body;

  //console.log('Extracted is_active:', {
    //raw: is_active,
    //type: typeof is_active,
    //converted: is_active === true || is_active === 1 || is_active === '1' ? 1 : 0
  //});

  // First check if attribute exists
  db.get('SELECT * FROM attributes WHERE id = ?', [attributeId], (err, row) => {
    if (err) {
      console.error('Database error checking attribute:', err);
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Attribute not found' });
      return;
    }


    const sql = `
      UPDATE attributes 
      SET name = ?,
          ui_name = ?,
          type = ?,
          scope = ?,
          is_required = ?,
          use_image = ?,
          allowed_values = ?,
          default_value = ?,
          product_group_ids = ?,
          product_type_ids = ?,
          is_active = ?
      WHERE id = ?
    `;

    // Ensure is_active is explicitly converted to 0/1
    const isActiveValue = is_active === true || is_active === 1 || is_active === '1' ? 1 : 0;

    const params = [
      name,
      ui_name,
      type,
      scope || 'product',
      is_required ? 1 : 0,
      use_image ? 1 : 0,
      allowed_values || '',
      default_value || '',
      product_group_ids ? JSON.stringify(product_group_ids) : null,
      product_type_ids ? JSON.stringify(product_type_ids) : null,
      isActiveValue,
      attributeId
    ];

    console.log('Update params:', {
      id: attributeId,
      is_active: isActiveValue,
      name,
      type
    });

    //console.log('Executing update with params:', params);

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database error updating attribute:', err);
        res.status(400).json({ error: err.message });
        return;
      }

      // Verify the update
      db.get('SELECT * FROM attributes WHERE id = ?', [attributeId], (verifyErr, updatedRow) => {
        if (verifyErr) {
          console.error('Error verifying update:', verifyErr);
        } else {
          //console.log('Updated DB state:', updatedRow);
        }
      });

      res.json({
        message: 'success',
        data: {
          id: attributeId,
          name,
          ui_name,
          type,
          scope,
          is_required,
          use_image,
          allowed_values,
          default_value,
          product_group_ids,
          product_type_ids,
          is_active: isActiveValue
        }
      });
    });
  });
});

module.exports = router; 
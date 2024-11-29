const express = require('express');
const cors = require('cors');
//const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('./swagger.json');
const db = require('./db');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the public directory
app.use('/assets', express.static('public/assets'));

// Swagger UI setup
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
//  explorer: true,
//  customCss: '.swagger-ui .topbar { display: none }',
//  customSiteTitle: "Collecty API Documentation"
//}));

// Products
app.use('/api/products', require('./api/products/get'));
app.use('/api/products', require('./api/products/post'));
app.use('/api/products', require('./api/products/put'));
app.use('/api/products', require('./api/products/delete'));

// Product Groups
app.use('/api/product-groups', require('./api/product-groups/get'));
app.use('/api/product-groups', require('./api/product-groups/post'));
app.use('/api/product-groups', require('./api/product-groups/put'));
app.use('/api/product-groups', require('./api/product-groups/delete'));

// Product Types
app.use('/api/product-types', require('./api/product-types/get'));
app.use('/api/product-types', require('./api/product-types/post'));
app.use('/api/product-types', require('./api/product-types/put'));
app.use('/api/product-types', require('./api/product-types/delete'));

// Product Sites
app.use('/api/product-sites', require('./api/product-sites/get'));
app.use('/api/product-sites', require('./api/product-sites/post'));

// Product Site Links
app.use('/api/product-site-links', require('./api/product-site-links/get'));
app.use('/api/product-site-links', require('./api/product-site-links/post'));

// Regions
app.use('/api/regions', require('./api/regions/get'));
app.use('/api/regions', require('./api/regions/post'));
app.use('/api/regions', require('./api/regions/put'));
app.use('/api/regions', require('./api/regions/delete'));

// Ratings
app.use('/api/ratings', require('./api/ratings/get'));
app.use('/api/ratings', require('./api/ratings/post'));
app.use('/api/ratings', require('./api/ratings/put'));
app.use('/api/ratings', require('./api/ratings/delete'));

// Rating Groups
app.use('/api/rating-groups', require('./api/rating-groups/get'));
app.use('/api/rating-groups', require('./api/rating-groups/post'));
app.use('/api/rating-groups', require('./api/rating-groups/put'));
app.use('/api/rating-groups', require('./api/rating-groups/delete'));

// Attributes
app.use('/api/attributes', require('./api/attributes/get'));
app.use('/api/attributes', require('./api/attributes/post'));
app.use('/api/attributes', require('./api/attributes/put'));
app.use('/api/attributes', require('./api/attributes/delete'));

// Product Attribute Values
app.use('/api/product-attribute-values', require('./api/product-attribute-values/get'));
app.use('/api/product-attribute-values', require('./api/product-attribute-values/getByProduct'));
app.use('/api/product-attribute-values', require('./api/product-attribute-values/getByAttribute'));
app.use('/api/product-attribute-values', require('./api/product-attribute-values/post'));
app.use('/api/product-attribute-values', require('./api/product-attribute-values/put'));
app.use('/api/product-attribute-values', require('./api/product-attribute-values/delete'));

// Inventory
app.use('/api/inventory', require('./api/inventory/get'));
app.use('/api/inventory', require('./api/inventory/post'));
app.use('/api/inventory', require('./api/inventory/put'));

// Inventory Attribute Values
app.use('/api/inventory-attribute-values', require('./api/inventory-attribute-values/get'));
app.use('/api/inventory-attribute-values', require('./api/inventory-attribute-values/getByInventory'));
app.use('/api/inventory-attribute-values', require('./api/inventory-attribute-values/post'));
app.use('/api/inventory-attribute-values', require('./api/inventory-attribute-values/put'));
app.use('/api/inventory-attribute-values', require('./api/inventory-attribute-values/delete'));

// PriceCharting Prices
app.use('/api/pricecharting-prices', require('./api/pricecharting-prices/get'));
app.use('/api/pricecharting-prices', require('./api/pricecharting-prices/post'));
app.use('/api/pricecharting-prices', require('./api/pricecharting-prices/put'));
app.use('/api/pricecharting-prices', require('./api/pricecharting-prices/delete'));

// Statistics
app.use('/api/statistics', require('./api/statistics/get'));

// Import routes
const productAttributeValuesCleanupRouter = require('./api/product-attribute-values/cleanup');
// ... other route imports ...

// Register routes
app.use('/api/product-attribute-values', productAttributeValuesCleanupRouter);
// ... other route registrations ...

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});

module.exports = app; 
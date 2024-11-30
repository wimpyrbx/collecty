const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const authMiddleware = require('./api/auth/middleware');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth routes (unprotected)
app.use('/api/auth/login', require('./api/auth/login'));

// Protected routes
app.use(authMiddleware);
app.use('/api/products', require('./api/products/get'));
app.use('/api/products', require('./api/products/post'));
app.use('/api/products', require('./api/products/put'));
app.use('/api/products', require('./api/products/delete'));
app.use('/api/product-groups', require('./api/product-groups/get'));
app.use('/api/product-types', require('./api/product-types/get'));
app.use('/api/regions', require('./api/regions/get'));
app.use('/api/ratings', require('./api/ratings/get'));
app.use('/api/rating-groups', require('./api/rating-groups/get'));
app.use('/api/attributes', require('./api/attributes/get'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
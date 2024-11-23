const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');

// Available themes
const THEMES = {
  muted: 'theme-muted.css',
  feeling_blue: 'theme-feeling-blue.css',
  flattop: 'theme-flattop.css',
  material: 'theme-material.css',
  monokai: 'theme-monokai.css',
  newspaper: 'theme-newspaper.css',
  outline: 'theme-outline.css'
};

// Default theme
let currentTheme = 'muted';

// Function to get theme CSS
const getThemeCSS = (themeName) => {
  const themePath = path.join(
    __dirname,
    `node_modules/swagger-ui-themes/themes/3.x/${THEMES[themeName]}`
  );
  return fs.readFileSync(themePath, 'utf8');
};

const app = express();
const PORT = 5000;

// Connect to the SQLite database
const dbPath = path.resolve(__dirname, 'database/db/collecty.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Middleware to parse JSON
app.use(express.json());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback){
    console.log('Request Origin:', origin);
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.log(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Theme switching endpoint
app.get('/api/theme/:name', (req, res) => {
  const themeName = req.params.name;
  if (THEMES[themeName]) {
    currentTheme = themeName;
    res.json({ message: 'Theme updated successfully', theme: themeName });
  } else {
    res.status(400).json({ error: 'Invalid theme name' });
  }
});

// Get available themes endpoint
app.get('/api/themes', (req, res) => {
  res.json({
    message: 'success',
    current: currentTheme,
    available: Object.keys(THEMES)
  });
});

// Update Swagger UI setup with dynamic theme
app.use('/api-docs', swaggerUi.serve, (req, res) => {
  const swaggerHtml = swaggerUi.generateHTML(swaggerDocument, {
    customCss: getThemeCSS(currentTheme),
    customSiteTitle: "Collecty API Documentation"
  });
  res.send(swaggerHtml);
});

// Import routes
const productGroupsGet = require('./api/product-groups/get');
const productGroupsPost = require('./api/product-groups/post');
const productGroupsPut = require('./api/product-groups/put');
const productGroupsDelete = require('./api/product-groups/delete');

const productTypesGet = require('./api/product-types/get');
const productTypesPost = require('./api/product-types/post');
const productTypesPut = require('./api/product-types/put');
const productTypesDelete = require('./api/product-types/delete');

const regionsGet = require('./api/regions/get');
const regionsPost = require('./api/regions/post');
const regionsPut = require('./api/regions/put');
const regionsDelete = require('./api/regions/delete');

const ratingGroupsGet = require('./api/rating-groups/get');
const ratingGroupsPost = require('./api/rating-groups/post');
const ratingGroupsPut = require('./api/rating-groups/put');
const ratingGroupsDelete = require('./api/rating-groups/delete');
const ratingGroupsGetByRegion = require('./api/rating-groups/getByRegion');

const ratingsGet = require('./api/ratings/get');
const ratingsPost = require('./api/ratings/post');
const ratingsPut = require('./api/ratings/put');
const ratingsDelete = require('./api/ratings/delete');
const ratingsGetByGroup = require('./api/ratings/getByGroup');

const productsGet = require('./api/products/get');
const productsPost = require('./api/products/post');
const productsPut = require('./api/products/put');
const productsDelete = require('./api/products/delete');
const productsGetByRegion = require('./api/products/getByRegion');
const productsGetByRating = require('./api/products/getByRating');

const inventoryGet = require('./api/inventory/get');
const inventoryPost = require('./api/inventory/post');
const inventoryPut = require('./api/inventory/put');
const inventoryDelete = require('./api/inventory/delete');
const inventoryGetByProduct = require('./api/inventory/getByProduct');

const productAttributeValuesGet = require('./api/product-attribute-values/get');
const productAttributeValuesPost = require('./api/product-attribute-values/post');
const productAttributeValuesPut = require('./api/product-attribute-values/put');
const productAttributeValuesDelete = require('./api/product-attribute-values/delete');
const productAttributeValuesGetByProduct = require('./api/product-attribute-values/getByProduct');
const productAttributeValuesGetByAttribute = require('./api/product-attribute-values/getByAttribute');

const inventoryAttributeValuesGet = require('./api/inventory-attribute-values/get');
const inventoryAttributeValuesPost = require('./api/inventory-attribute-values/post');
const inventoryAttributeValuesPut = require('./api/inventory-attribute-values/put');
const inventoryAttributeValuesDelete = require('./api/inventory-attribute-values/delete');
const inventoryAttributeValuesGetByInventory = require('./api/inventory-attribute-values/getByInventory');

const pricechartingPricesGet = require('./api/pricecharting-prices/get');
const pricechartingPricesPost = require('./api/pricecharting-prices/post');
const pricechartingPricesPut = require('./api/pricecharting-prices/put');
const pricechartingPricesDelete = require('./api/pricecharting-prices/delete');

const productSitesGet = require('./api/product-sites/get');
const productSitesPost = require('./api/product-sites/post');
const productSitesPut = require('./api/product-sites/put');
const productSitesDelete = require('./api/product-sites/delete');

const productSiteLinksGet = require('./api/product-site-links/get');
const productSiteLinksPost = require('./api/product-site-links/post');
const productSiteLinksPut = require('./api/product-site-links/put');
const productSiteLinksDelete = require('./api/product-site-links/delete');
const productSiteLinksGetByProduct = require('./api/product-site-links/getByProduct');
const productSiteLinksGetBySite = require('./api/product-site-links/getBySite');

const attributesGet = require('./api/attributes/get');
const attributesPost = require('./api/attributes/post');
const attributesPut = require('./api/attributes/put');
const attributesDelete = require('./api/attributes/delete');

const productsGetByGroup = require('./api/products/getByGroup');
const productsGetByType = require('./api/products/getByType');

// Import extended endpoints
const productsGetExtended = require('./api/products/getExtended');
const inventoryGetExtended = require('./api/inventory/getExtended');
const regionsGetExtended = require('./api/regions/getExtended');
const ratingsGetExtended = require('./api/ratings/getExtended');
const ratingGroupsGetExtended = require('./api/rating-groups/getExtended');

// Use routes
app.use('/api/product-groups', productGroupsGet);
app.use('/api/product-groups', productGroupsPost);
app.use('/api/product-groups', productGroupsPut);
app.use('/api/product-groups', productGroupsDelete);

app.use('/api/product-types', productTypesGet);
app.use('/api/product-types', productTypesPost);
app.use('/api/product-types', productTypesPut);
app.use('/api/product-types', productTypesDelete);

app.use('/api/regions', regionsGet);
app.use('/api/regions', regionsPost);
app.use('/api/regions', regionsPut);
app.use('/api/regions', regionsDelete);

app.use('/api/rating-groups', ratingGroupsGet);
app.use('/api/rating-groups', ratingGroupsPost);
app.use('/api/rating-groups', ratingGroupsPut);
app.use('/api/rating-groups', ratingGroupsDelete);
app.use('/api/rating-groups', ratingGroupsGetByRegion);

app.use('/api/ratings', ratingsGet);
app.use('/api/ratings', ratingsPost);
app.use('/api/ratings', ratingsPut);
app.use('/api/ratings', ratingsDelete);
app.use('/api/ratings', ratingsGetByGroup);

app.use('/api/products', productsGet);
app.use('/api/products', productsPost);
app.use('/api/products', productsPut);
app.use('/api/products', productsDelete);
app.use('/api/products', productsGetByRegion);
app.use('/api/products', productsGetByRating);

app.use('/api/inventory', inventoryGet);
app.use('/api/inventory', inventoryPost);
app.use('/api/inventory', inventoryPut);
app.use('/api/inventory', inventoryDelete);
app.use('/api/inventory', inventoryGetByProduct);

app.use('/api/product-attribute-values', productAttributeValuesGet);
app.use('/api/product-attribute-values', productAttributeValuesPost);
app.use('/api/product-attribute-values', productAttributeValuesPut);
app.use('/api/product-attribute-values', productAttributeValuesDelete);
app.use('/api/product-attribute-values', productAttributeValuesGetByProduct);
app.use('/api/product-attribute-values', productAttributeValuesGetByAttribute);

app.use('/api/inventory-attribute-values', inventoryAttributeValuesGet);
app.use('/api/inventory-attribute-values', inventoryAttributeValuesPost);
app.use('/api/inventory-attribute-values', inventoryAttributeValuesPut);
app.use('/api/inventory-attribute-values', inventoryAttributeValuesDelete);
app.use('/api/inventory-attribute-values', inventoryAttributeValuesGetByInventory);

app.use('/api/pricecharting-prices', pricechartingPricesGet);
app.use('/api/pricecharting-prices', pricechartingPricesPost);
app.use('/api/pricecharting-prices', pricechartingPricesPut);
app.use('/api/pricecharting-prices', pricechartingPricesDelete);

app.use('/api/product-sites', productSitesGet);
app.use('/api/product-sites', productSitesPost);
app.use('/api/product-sites', productSitesPut);
app.use('/api/product-sites', productSitesDelete);

app.use('/api/product-site-links', productSiteLinksGet);
app.use('/api/product-site-links', productSiteLinksPost);
app.use('/api/product-site-links', productSiteLinksPut);
app.use('/api/product-site-links', productSiteLinksDelete);
app.use('/api/product-site-links', productSiteLinksGetByProduct);
app.use('/api/product-site-links', productSiteLinksGetBySite);

app.use('/api/attributes', attributesGet);
app.use('/api/attributes', attributesPost);
app.use('/api/attributes', attributesPut);
app.use('/api/attributes', attributesDelete);

app.use('/api/products', productsGetByGroup);
app.use('/api/products', productsGetByType);

app.use('/api/products', productsGetExtended);
app.use('/api/inventory', inventoryGetExtended);
app.use('/api/regions', regionsGetExtended);
app.use('/api/ratings', ratingsGetExtended);
app.use('/api/rating-groups', ratingGroupsGetExtended);

app.post('/api/proxy/dlnk', async (req, res) => {
  try {
    const response = await axios.post('https://dlnk.one/e', req.body, {
      params: {
        id: req.query.id,
        type: req.query.type
      }
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Proxy request failed.' });
  }
});

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
}); 
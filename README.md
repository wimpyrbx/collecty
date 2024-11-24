# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Collecty API

This project provides a RESTful API for managing product groups and related entities.

## API Endpoints

### Product Groups

- **GET /api/product-groups**: List all product groups.
- **POST /api/product-groups**: Create a new product group.
- **PUT /api/product-groups/:id**: Update a product group by ID.
- **DELETE /api/product-groups/:id**: Delete a product group by ID.

### Product Types

- **GET /api/product-types**: List all product types.
- **POST /api/product-types**: Create a new product type.
- **PUT /api/product-types/:id**: Update a product type by ID.
- **DELETE /api/product-types/:id**: Delete a product type by ID.

### Regions

- **GET /api/regions**: List all regions.
- **POST /api/regions**: Create a new region.
- **PUT /api/regions/:id**: Update a region by ID.
- **DELETE /api/regions/:id**: Delete a region by ID.

### Rating Groups

- **GET /api/rating-groups**: List all rating groups.
- **POST /api/rating-groups**: Create a new rating group.
- **PUT /api/rating-groups/:id**: Update a rating group by ID.
- **DELETE /api/rating-groups/:id**: Delete a rating group by ID.

### Ratings

- **GET /api/ratings**: List all ratings.
- **POST /api/ratings**: Create a new rating.
- **PUT /api/ratings/:id**: Update a rating by ID.
- **DELETE /api/ratings/:id**: Delete a rating by ID.

### Products

- **GET /api/products**: List all products with basic information.
  - Query Parameters:
    - groupId: Filter by product group
    - typeId: Filter by product type
    - regionId: Filter by region
    - sortField: Field to sort by
    - sortOrder: 'asc' or 'desc'
    - page: Page number
    - limit: Items per page

- **GET /api/products/extended/:id?**: Get extended product information.
  - Optional URL Parameter:
    - id: Specific product ID
  - Query Parameters:
    - Same as /api/products endpoint
  - Returns additional data:
    - Product group name
    - Product type name
    - Region name
    - Rating information
    - Attributes
    - Site links
    - Pricing information

- **POST /api/products**: Create a new product.
- **PUT /api/products/:id**: Update a product by ID.
- **DELETE /api/products/:id**: Delete a product by ID.

### Inventory

- **GET /api/inventory**: List all inventory items.
- **POST /api/inventory**: Create a new inventory item.
- **PUT /api/inventory/:id**: Update an inventory item by ID.
- **DELETE /api/inventory/:id**: Delete an inventory item by ID.

### Product Attribute Values

- **GET /api/product-attribute-values**: List all product attribute values.
- **POST /api/product-attribute-values**: Create a new product attribute value.
- **PUT /api/product-attribute-values/:id**: Update a product attribute value by ID.
- **DELETE /api/product-attribute-values/:id**: Delete a product attribute value by ID.

### Other Tables

- **Inventory Attribute Values**: Implement similar CRUD operations.
- **Pricecharting Prices**: Implement similar CRUD operations.
- **Product Sites**: Implement similar CRUD operations.
- **Product Site Links**: Implement similar CRUD operations.
- **Attributes**: Implement similar CRUD operations.

const path = require('path');

module.exports = {
  // ... other webpack config ...
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      return middlewares;
    },
    static: {
      directory: path.join(__dirname, 'public'),
    },
    hot: true,
    port: 3000,
  }
}; 
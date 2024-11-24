import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductGroups from './pages/products/ProductGroups';
import ProductTypes from './pages/products/ProductTypes';
import ProductAttributes from './pages/products/ProductAttributes';
import InventoryList from './pages/inventory/InventoryList';
import InventoryAttributes from './pages/inventory/InventoryAttributes';
import Regions from './pages/reference/Regions';
import Ratings from './pages/reference/Ratings';
import ProductSites from './pages/reference/ProductSites';
import CollectionCompletion from './pages/statistics/CollectionCompletion';
import CollectionValue from './pages/statistics/CollectionValue';
import UITest from './pages/UITest';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ui-test" element={<UITest />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/groups" element={<ProductGroups />} />
            <Route path="/products/types" element={<ProductTypes />} />
            <Route path="/products/attributes" element={<ProductAttributes />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/attributes" element={<InventoryAttributes />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/ratings" element={<Ratings />} />
            <Route path="/sites" element={<ProductSites />} />
            <Route path="/statistics/completion" element={<CollectionCompletion />} />
            <Route path="/statistics/value" element={<CollectionValue />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

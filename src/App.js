import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Layout/Sidebar/Sidebar';
import './styles/layout.css';
import './styles/custom.css';
import ThemeSwitcher from './components/ThemeSwitcher/ThemeSwitcher';

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
import StatsTest from './pages/StatsTest';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <div className="d-flex justify-content-end p-2">
              <ThemeSwitcher />
            </div>
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
              <Route path="/stats-test" element={<StatsTest />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

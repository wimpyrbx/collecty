import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar/Sidebar';
import './styles/layout.css';
import './styles/custom.css';
import ThemeSwitcher from './components/common/Utils/ThemeSwitcher';
import { Toaster } from 'react-hot-toast';

// Pages
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductGroups from './pages/products/ProductGroups';
import ProductTypes from './pages/products/ProductTypes';
import InventoryList from './pages/inventory/InventoryList';
import RegionRatingManagement from './pages/reference/RegionRatingManagement';
import ProductSites from './pages/reference/ProductSites';
import CollectionCompletion from './pages/statistics/CollectionCompletion';
import CollectionValue from './pages/statistics/CollectionValue';
import UITest from './pages/UITest';
import StatsTest from './pages/StatsTest';
import Attributes from './pages/attributes/Attributes';
import GroupTypeManagement from './pages/products/GroupTypeManagement';

function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ui-test" element={<UITest />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/groups-types" element={<GroupTypeManagement />} />
              <Route path="/attributes" element={<Attributes />} />
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/reference/region-ratings" element={<RegionRatingManagement />} />
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

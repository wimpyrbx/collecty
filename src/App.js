import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar/Sidebar';
import './styles/layout.css';
import './styles/custom.css';
import ThemeSwitcher from './components/common/Utils/ThemeSwitcher';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import axios from 'axios';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
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
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

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
          <Sidebar onLogout={handleLogout} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

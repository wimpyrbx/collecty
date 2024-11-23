import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Overview from './pages/Overview';
import Admin from './pages/Admin';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.style.setProperty(
      '--background-color',
      darkMode ? '#ffffff' : '#282c34'
    );
    document.documentElement.style.setProperty(
      '--text-color',
      darkMode ? '#000000' : '#ffffff'
    );
  };

  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="Content">
          <button onClick={toggleDarkMode} style={{ margin: '20px' }}>
            Toggle Dark Mode
          </button>
          <Routes>
            <Route path="/overview" element={<Overview />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

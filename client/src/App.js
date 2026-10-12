import React, { useState } from 'react';
import './App.css';
import Home from './components/Home';
import About from './components/About';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app-container">
      {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
      {currentPage === 'about' && <About setCurrentPage={setCurrentPage} />}
    </div>
  );
}

export default App;

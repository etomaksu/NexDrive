import React, { useState } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import About from './components/About';
import LoginPage from './components/users/LoginPage';
import RegistrationPage from './components/users/RegistrationPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app-container">
      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'about' && <About setCurrentPage={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'register' && <RegistrationPage setCurrentPage={setCurrentPage} />}
    </div>
  );
}

export default App;
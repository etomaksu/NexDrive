import React, { useState } from 'react';
import './App.css';

import HomePage from './components/users/HomePage';
import About from './components/mainlanding/About';
import LoginPage from './components/mainlanding/LoginPage';
import RegistrationPage from './components/mainlanding/RegistrationPage';
import CarListings from './components/users/CarListings';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="App">
      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'register' && <RegistrationPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'contact' && <About setCurrentPage={setCurrentPage} />}
      {currentPage === 'cars' && <CarListings setCurrentPage={setCurrentPage} />}
    </div>
  );
}

export default App;
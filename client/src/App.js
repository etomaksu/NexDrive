import React, { useState } from 'react';
import './App.css';

import HomePage from './components/users/HomePage';
import LoginPage from './components/mainlanding/LoginPage';
import RegistrationPage from './components/mainlanding/RegistrationPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="App">
      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'register' && <RegistrationPage setCurrentPage={setCurrentPage} />}

    </div>
  );
}

export default App;
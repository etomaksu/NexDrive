import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import './App.css';

import Navbar from './components/NavBar';
import HomePage from './components/HomePage';
import About from './components/mainlanding/About';
import LoginPage from './components/mainlanding/LoginPage';
import RegistrationPage from './components/mainlanding/RegistrationPage';
import CarListings from './components/users/CarListings';
import CarDetails from './components/users/CarDetails';

// pages that have their own full-screen layout, so no navbar
const pagesWithoutNavbar = ['login', 'register'];

function App() {
  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem('token') ? 'home' : 'login'
  );
  const [selectedCarId, setSelectedCarId] = useState(null);

  // null = logged out, "Althea Lois" = logged in
  const [user, setUser] = useState(null);
  const isLoggedIn = Boolean(user);

  // LoginPage calls this after a successful login: onLogin('Althea Lois')
  const handleLogin = (name) => {
    setUser(name);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#003b86',
          borderRadius: 8,
          fontFamily: "'Manrope', system-ui, sans-serif",
        },
      }}
    >
      <div className="App">
        {!pagesWithoutNavbar.includes(currentPage) && (
          <Navbar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            userName={user}
            brandName="Webname"
          />
        )}

        {currentPage === 'home' && (
          <HomePage
            isLoggedIn={isLoggedIn}
            setCurrentPage={setCurrentPage}
            setSelectedCarId={setSelectedCarId}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />
        )}

        {currentPage === 'register' && (
          <RegistrationPage setCurrentPage={setCurrentPage} />
        )}

        {(currentPage === 'contact' || currentPage === 'about') && (
          <About setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'cars' && (
          <CarListings
            setCurrentPage={setCurrentPage}
            setSelectedCarId={setSelectedCarId}
          />
        )}

        {currentPage === 'cardetails' && (
          <CarDetails
            selectedCarId={selectedCarId}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
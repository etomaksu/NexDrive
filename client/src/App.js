import React, { useState } from 'react';
import './App.css';

import LoginPage from './components/users/LoginPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="App">
      <LoginPage/>
    </div>
  );
}
//testtt
export default App;
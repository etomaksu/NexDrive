import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import './App.css';
import {Routes, Route, Navigate, useNavigate, useLocation} from 'react-router-dom'
import HomePage from './components/HomePage';

//Customer Landing Page
import Navbar from './components/NavBar';
import About from './components/users/mainlanding/About';
import LoginPage from './components/users/mainlanding/LoginPage';
import RegistrationPage from './components/users/mainlanding/RegistrationPage';
import CarListings from './components/users/CarListings';
import CarDetails from './components/users/CarDetails';
import CustomerDashboard from './components/users/CustomerDashboard';

//Admin Dashboard
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminDashboard from "./components/admin/pages/AdminDashboard";
import Vehicles from "./components/admin/pages/Vehicles";
import StaffList from "./components/admin/pages/StaffList";
import Archive from "./components/admin/pages/Archive";
import Reports from "./components/admin/pages/Reports";
import Transactions from "./components/admin/pages/Transactions";
import Messages from "./components/admin/pages/Messages";

const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  cars: '/cars',
  contact: '/contact',
  about: '/contact',
  dashboard: '/dashboard'
}

const getCurrentPage = (pathname) => {
  if (pathname.startsWith('/cars')) return 'cardetails'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  const match = Object.entries(paths).find(([, p]) => p === pathname)
  return match ? match[0] : 'home'
}

const isAdmin = (user) => user?.role === 'admin'

const ProtectedRoute = ({isLoggedIn, children}) => isLoggedIn ? children : <Navigate to="/login" replace />
const AdminRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin(user)) return <Navigate to="/" replace />
  return children
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState(() => 
    JSON.parse(localStorage.getItem('user') || 'null')  
  );

  const isLoggedIn = Boolean(user);

  const currentPage = getCurrentPage(location.pathname)
  const setCurrentPage = (page) => navigate(paths[page] || '/')
  const hideNavbar = ['/login', '/register'].includes(location.pathname)
                      || location.pathname.startsWith('/admin');

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate(userData.role === 'admin' ? '/admin' : '/')
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login')
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
        {!hideNavbar && (
          <Navbar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            userName={user ? user.firstName : null}
            onLogout={handleLogout}
            brandName="NexDrive"
          />
        )}

        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} setCurrentPage={setCurrentPage} />} />
          <Route path="/login" element={<LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />} />
          <Route path="/register" element={<RegistrationPage setCurrentPage={setCurrentPage} />} />
          <Route path="/contact" element={<About setCurrentPage={setCurrentPage} />} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CustomerDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
            } 
          />

          <Route path="/cars" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}><CarListings /></ProtectedRoute>
          } />
          <Route path="/cars/:carId" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}><CarDetails /></ProtectedRoute>
          } />

            <Route
              path="/admin"
              element={
                <AdminRoute user={user}>
                  <AdminLayout onLogout={handleLogout} />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="staff" element={<StaffList />} />
              <Route path="archive" element={<Archive />} />
              <Route path="reports" element={<Reports />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="messages" element={<Messages />} />
            </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
      </div>
    </ConfigProvider>
  );
}

export default App;
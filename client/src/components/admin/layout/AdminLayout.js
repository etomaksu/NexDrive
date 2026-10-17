import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import "../admin.css";

export default function AdminLayout({ user, onLogout }) {
  const [unread, setUnread] = useState(0);
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Admin';

  return (
    <div className='admin-shell'>
      <Sidebar onLogout={onLogout} unread={unread} />
      <div className='admin-main'>
        <Topbar user={{ name, role: 'Admin' }} />
        <main className='admin-content'>
          <Outlet context={{ setUnread }} />
        </main>
      </div>
    </div>
  )
}
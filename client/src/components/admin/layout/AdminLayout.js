import React, {useState} from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import "../admin.css";


export default function AdminLayout({onLogout}){
  const [unread, setUnread] = useState(2);
  return (
    <div className='admin-shell'>
        <Sidebar onLogout ={onLogout}/>
        <div className='admin-main'>
            <Topbar/>
            <main className='admin-content'>
                <Outlet context={{setUnread}}/>
            </main>
        </div>
    </div>
  )
}

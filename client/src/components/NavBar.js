import React, { useState } from 'react'
import { Menu, Input, Button, Badge, Avatar, Space, Typography } from 'antd'
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons'
import './NavBar.css'

// Add / remove links here and the navbar updates by itself.
// "also"     = other pages that should keep this link highlighted.
// "authOnly" = only shown when someone is logged in.
const links = [
  { label: 'Home', page: 'home' },
  { label: 'Cars', page: 'cars', also: ['cardetails'] },
  { label: 'Dashboard', page: 'dashboard', authOnly: true },
  { label: 'Contact', page: 'contact' },
]

// userName = null / undefined -> logged-out navbar (Login + Register)
// userName = "Althea Lois"    -> logged-in navbar (bell + profile)
const Navbar = ({
  currentPage,
  setCurrentPage,
  userName = null,
  onLogout,
  brandName = 'NexDrive',
  onSearch,
  searchPlaceholder = 'Search cars, bookings',
}) => {
  const [query, setQuery] = useState('')
  const isLoggedIn = Boolean(userName)

  const visibleLinks = links.filter((link) => !link.authOnly || isLoggedIn)

  const activeLink = visibleLinks.find(
    (link) => link.page === currentPage || (link.also && link.also.includes(currentPage))
  )

  const menuItems = visibleLinks.map((link) => ({ key: link.page, label: link.label }))

  return (
    <header className="navbar">
      <div className="navbarLeft">
        <Typography.Link className="navLogo" onClick={() => setCurrentPage('home')}>
          {brandName}
        </Typography.Link>

        <Menu
          className="navMenu"
          mode="horizontal"
          selectedKeys={activeLink ? [activeLink.page] : []}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key)}
          disabledOverflow
        />

        <Input
          className="navSearch"
          size="large"
          allowClear
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={() => onSearch && onSearch(query.trim())}
        />
      </div>

      <Space size="large" className="navbarRight">
        {isLoggedIn ? (
          <>
            <Badge dot>
              <Button type="text" shape="circle" size="large" icon={<BellOutlined />} aria-label="Notifications" />
            </Badge>
            <Space>
              <Avatar size="large" icon={<UserOutlined />} />
              <Typography.Text strong>Hi, {userName}</Typography.Text>
              <button onClick={onLogout}>Log out</button>
            </Space>
          </>
        ) : (
          <>
            <Button onClick={() => setCurrentPage('login')}>Login</Button>
            <Button type="primary" onClick={() => setCurrentPage('register')}>
              Register
            </Button>
          </>
        )}
      </Space>
    </header>
  )
}

export default Navbar
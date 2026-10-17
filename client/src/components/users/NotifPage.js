import React from 'react'
import AccNavBar from "./src/components/users/AccNavBar";


const NotifPage = () => {
  return (
    <div>
        <div className="account">
            <div className="acc-navbar">
                <button type="button" className="back-btn">← Dashboard</button>

                <AccNavBar current="/notif"/>
            </div>
 
            <main className="account-main">
                <header className="account-header notif-header">
                    <div>
                        <h1>Notifications</h1>
                        <p className="notif-subtitle">
                        Booking updates, payment receipts and pickup reminders.
                        </p>
                    </div>

                    <button type="button" className="btn-primary">Mark all as read</button>
                </header>
        
                <div className="notif-toolbar">
                    <div className="chips" role="group" aria-label="Filter notifications">
                        <button type="button" className="chip" aria-pressed="true">
                        All <span className="chip-count">5</span>
                        </button>
                        <button type="button" className="chip" aria-pressed="false">
                        Unread <span className="chip-count">2</span>
                        </button>

                        <button type="button" className="chip" aria-pressed="false">Bookings</button>
                        <button type="button" className="chip" aria-pressed="false">Payments</button>
                        <button type="button" className="chip" aria-pressed="false">Reminders</button>
                    </div>
        
                <label className="sort">
                    <span className="sr-only">Sort notifications</span>
                    <select name="sort" defaultValue="newest">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    </select>
                </label>
                </div>
        
                <div className="notif-layout">
                {/* Notification list */}
                <div className="card notif-list">
                    <section aria-labelledby="group-today">
                    <h2 className="group-title" id="group-today">Today</h2>
                    <ul>
                        <li className="notif is-unread">
                        <span className="notif-icon tone-green">
                            <svg {...svgProps}><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 10h18" /></svg>
                        </span>
                        <div className="notif-body">
                            <p className="notif-title">Booking confirmed</p>
                            <p className="notif-text">Your Toyota Fortuner is reserved for Oct 10 – 13, Imus branch.</p>
                        </div>
                        <div className="notif-meta">
                            <span className="notif-time"><span className="dot" aria-label="Unread" /> 2 min ago</span>
                            <button type="button" className="btn-small">View booking</button>
                        </div>
                        </li>
        
                        <li className="notif is-unread">
                        <span className="notif-icon tone-blue">
                            <svg {...svgProps}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                        </span>
                        <div className="notif-body">
                            <p className="notif-title">Payment received</p>
                            <p className="notif-text">₱12,650 paid by card. Your receipt is ready to download.</p>
                        </div>
                        <div className="notif-meta">
                            <span className="notif-time"><span className="dot" aria-label="Unread" /> 10 min ago</span>
                            <button type="button" className="btn-small">Download receipt</button>
                        </div>
                        </li>
                    </ul>
                    </section>
        
                    <section aria-labelledby="group-earlier">
                    <h2 className="group-title" id="group-earlier">Earlier</h2>
                    <ul>
                        <li className="notif">
                        <span className="notif-icon tone-yellow">
                            <svg {...svgProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                        </span>
                        <div className="notif-body">
                            <p className="notif-title">Pickup reminder</p>
                            <p className="notif-text">Pick up your car tomorrow at 9:00 AM, Imus branch.</p>
                        </div>
                        <div className="notif-meta">
                            <span className="notif-time">1 day ago</span>
                            <button type="button" className="btn-small">View details</button>
                        </div>
                        </li>
        
                        <li className="notif">
                        <span className="notif-icon tone-red">
                            <svg {...svgProps}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
                        </span>
                        <div className="notif-body">
                            <p className="notif-title">License under review</p>
                            <p className="notif-text">We will notify you once your driver&apos;s license is verified.</p>
                        </div>
                        <div className="notif-meta">
                            <span className="notif-time">2 days ago</span>
                            <button type="button" className="btn-small">Open profile</button>
                        </div>
                        </li>
        
                        <li className="notif">
                        <span className="notif-icon tone-red">
                            <svg {...svgProps}><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></svg>
                        </span>
                        <div className="notif-body">
                            <p className="notif-title">Booking cancelled</p>
                            <p className="notif-text">Booking #DE-0931 was cancelled. Refund in 3–5 days.</p>
                        </div>
                        <div className="notif-meta">
                            <span className="notif-time">May 3</span>
                            <button type="button" className="btn-small">View details</button>
                        </div>
                        </li>
                    </ul>
                    </section>
                </div>
        
                {/* Settings */}
                <aside className="card notif-settings" aria-labelledby="settings-title">
                    <h2 id="settings-title">Notification settings</h2>
                    <p className="settings-desc">Choose what you hear about and where.</p>
        
                    <fieldset className="switch-group">
                    <legend>Notify me about</legend>
                    <label className="switch-row">
                        <span>Booking updates</span>
                        <input type="checkbox" role="switch" className="switch" name="bookingUpdates" defaultChecked />
                    </label>
                    <label className="switch-row">
                        <span>Payment receipts</span>
                        <input type="checkbox" role="switch" className="switch" name="paymentReceipts" defaultChecked />
                    </label>
                    <label className="switch-row">
                        <span>Pickup reminders</span>
                        <input type="checkbox" role="switch" className="switch" name="pickupReminders" defaultChecked />
                    </label>
                    <label className="switch-row">
                        <span>Offers and news</span>
                        <input type="checkbox" role="switch" className="switch" name="offers" />
                    </label>
                    </fieldset>
        
                    <fieldset className="switch-group">
                    <legend>Send them by</legend>
                    <label className="switch-row">
                        <span>Email</span>
                        <input type="checkbox" role="switch" className="switch" name="email" defaultChecked />
                    </label>
                    <label className="switch-row">
                        <span>Push</span>
                        <input type="checkbox" role="switch" className="switch" name="push" defaultChecked />
                    </label>
                    <label className="switch-row">
                        <span>SMS</span>
                        <input type="checkbox" role="switch" className="switch" name="sms" />
                    </label>
                    </fieldset>
                </aside>
                </div>
            </main>
        </div>
    </div>
  )
}

export default NotifPage

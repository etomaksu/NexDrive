import React from 'react'
import AccNavBar from "./src/components/users/AccNavBar";

const AccSettingsPage = () => {
  return (
    <div>
        <div className="profile-page">
            <div className="acc-navbar">
                <button type="button" className="back-btn">← Dashboard</button>

                <AccNavBar current="/profile"/>
            </div>
 
            <main className="account-main">
                <form>
                <header className="account-header">
                    <h1>Account settings</h1>
                    <button type="submit" className="btn-primary">Save changes</button>
                </header>
        
                {/* Personal information */}
                <section className="card" aria-labelledby="personal-title">
                    <h2 id="personal-title">Personal information</h2>
        
                    <div className="form-grid">
                    <div className="field">
                        <label htmlFor="fullName">Full name</label>
                        <input id="fullName" name="fullName" type="text" autoComplete="name" defaultValue="Althea Lois Ramos" />
                    </div>
                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" autoComplete="email" defaultValue="you@email.com" />
                    </div>
                    <div className="field">
                        <label htmlFor="phone">Phone</label>
                        <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue="+63 900 000 0000" />
                    </div>
                    <div className="field">
                        <label htmlFor="address">Address</label>
                        <input id="address" name="address" type="text" autoComplete="street-address" defaultValue="Imus, Cavite" />
                    </div>
                    </div>
                </section>
        
                {/* Driver's license */}
                <section className="card" aria-labelledby="license-title">
                    <h2 id="license-title">Driver&apos;s license</h2>
        
                    <div className="dropzone">
                    <p className="dropzone-title">Drag and drop your license (front and back)</p>
                    <p className="dropzone-sub">JPG or PNG, up to 5 MB</p>
        
                    <input id="licenseFile" name="license" type="file" accept="image/jpeg,image/png" multiple hidden />
                    <label htmlFor="licenseFile" className="btn-secondary">Upload file</label>
                    </div>
        
                    <span className="badge badge-pending">Verification pending</span>
                </section>
        
                {/* Saved payment method */}
                <section className="card" aria-labelledby="saved-title">
                    <h2 id="saved-title">Saved payment method</h2>
        
                    <div className="saved-card">
                    <span className="saved-card-name">Visa ending 4417</span>
                    <span className="saved-card-meta">
                        <span>Expires 12/28</span>
                        <button type="button" className="btn-danger">Remove</button>
                    </span>
                    </div>
                </section>
                </form>
            </main>
        </div>
    </div>
  )
}

export default AccSettingsPage

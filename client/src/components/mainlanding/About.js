import React from 'react';

function AboutPage({ setCurrentPage }) {
  return (
    <div className="pageWrapper">
      <header className="navbar">
        <div className="navLeft">
          <span className="brandLogo" onClick={() => setCurrentPage('home')} style={{cursor: 'pointer'}}>NexDrive</span>
          <nav className="navLinks">
            <button className="navLinkBtn" onClick={() => setCurrentPage('home')}>Home</button>
            <button className="navLinkBtn" onClick={() => setCurrentPage('cars')}>Cars</button>
            <button className="navLinkBtn active" onClick={() => setCurrentPage('about')}>About</button>
            <button className="navLinkBtn" onClick={() => setCurrentPage('contact')}>Contact</button>
          </nav>
        </div>
        <div className="navRight">
          <button className="btnLogin" onClick={() => setCurrentPage('login')}>Login</button>
          <button className="btnRegister" onClick={() => setCurrentPage('register')}>Register</button>
        </div>
      </header>

      <section className="aboutHead">
        <div className="aboutContainer">
          <h1>About NexDrive</h1>
          <p>A local car rental service based in Imus, Cavite.</p>
          
          <div className="aboutGrid">
            <div className="infoBox">
              <h3>Transparent pricing</h3>
              <p>What you see is what you pay. No hidden fees.</p>
            </div>
            <div className="infoBox">
              <h3>Well-kept fleet</h3>
              <p>Every vehicle is inspected before each rental.</p>
            </div>
            <div className="infoBox">
              <h3>Real people, 24/7</h3>
              <p>Roadside help whenever you need it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contactFaqSection">
        <div className="aboutContainer contactFaqGrid">
          
          <div className="contactBox">
            <h2>Contact us</h2>
            <div className="formGroup">
              <label>Name</label>
              <input type="text" placeholder="Full Name" />
            </div>
            <div className="formGroup">
              <label>Email</label>
              <input type="email" placeholder="hello@email.com" />
            </div>
            <div className="formGroup">
              <label>Message</label>
              <textarea placeholder="How can we help?" rows="4"></textarea>
            </div>
            <button className="btnSubmit">Send message</button>
          </div>

          <div className="faqBox">
            <h2>FAQ</h2>
            
            <div className="faqItem active">
              <div className="faqQuestion">
                <span>What do I need to rent a car?</span>
                <span className="faqIcon">-</span>
              </div>
              <p className="faqAnswer">A valid driver's license, a government ID and a payment method.</p>
            </div>

            <div className="faqItem">
              <div className="faqQuestion">
                <span>Can I cancel or reschedule?</span>
                <span className="faqIcon">+</span>
              </div>
            </div>

            <div className="faqItem">
              <div className="faqQuestion">
                <span>Is insurance included?</span>
                <span className="faqIcon">+</span>
              </div>
            </div>

            <div className="faqItem">
              <div className="faqQuestion">
                <span>Do you offer delivery?</span>
                <span className="faqIcon">+</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="aboutContainer footerGrid">
          <div>
            <h3 className="footerLogo">NexDrive</h3>
            <p>Car rental made simple.</p>
            <p className="footerLoc">Imus, Cavite, Philippines</p>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li onClick={() => setCurrentPage('about')}>About us</li>
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4>Fleet</h4>
            <ul>
              <li>SUVs</li>
              <li>Sedans</li>
              <li>Vans</li>
              <li>Pickup</li>
              <li>EV</li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <p>help@nexdrive.ph</p>
            <p>+63 900 000 0000</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;
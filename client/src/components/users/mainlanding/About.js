import React, { useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import './About.css';

const API = 'http://localhost:8000/api';

const FAQS = [
  { q: 'What do I need to rent a car?', a: "A valid driver's license, a government ID and a payment method." },
  { q: 'Can I cancel or reschedule?', a: 'You can cancel a booking from My bookings before it starts. For changes to your dates, send us a message.' },
  { q: 'Is insurance included?', a: 'Basic insurance is included with every rental. Ask us about extra coverage.' },
  { q: 'Do you offer delivery?', a: 'Yes, within Imus and nearby areas. Set your pick-up location when you book.' },
];

function AboutPage({ setCurrentPage }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return message.warning('Please fill in your name, email and message.');
    }
    try {
      setSending(true);
      await axios.post(`${API}/messages`, form);
      message.success('Message sent! We will get back to you by email.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pageWrapper">

      <section className="aboutHead">
        <div className="aboutContainer">
          <div className="aboutContainerText">
          <h1>About NexDrive</h1>
          <p>A local car rental service based in Imus, Cavite.</p>
          </div>
          
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
          
          <form className="contactBox" onSubmit={handleSubmit}>
            <h2>Contact us</h2>
            <div className="formGroup">
              <label>Name</label>
              <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={onChange} maxLength={100} />
            </div>
            <div className="formGroup">
              <label>Email</label>
              <input type="email" name="email" placeholder="hello@email.com" value={form.email} onChange={onChange} maxLength={150} />
            </div>
            <div className="formGroup">
              <label>Message</label>
              <textarea name="message" placeholder="How can we help?" rows="4" value={form.message} onChange={onChange} maxLength={2000}></textarea>
            </div>
            <button type="submit" className="btnSubmit" disabled={sending}>{sending ? 'Sending...' : 'Send message'}</button>
          </form>

          <div className="faqBox">
            <h2>FAQ</h2>
            {FAQS.map((f, i) => (
              <div key={f.q} className={`faqItem ${openFaq === i ? 'active' : ''}`}>
                <div className="faqQuestion" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ cursor: 'pointer' }}>
                  <span>{f.q}</span>
                  <span className="faqIcon">{openFaq === i ? '-' : '+'}</span>
                </div>
                {openFaq === i && <p className="faqAnswer">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footerInner">
          <div>
            <h3 className="footerLogo">NexDrive</h3>
            <ul>
              <li>Car rental made simple. <br /> Pasay City, Philippines</li>
          </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li className="aboutList" onClick={() => setCurrentPage('about')}>About us <br /> Contact <br /> FAQ</li>
            </ul>
          </div>
          <div>
            <div>
          <h4>Support</h4>
          <ul>
              <li>help@nexdrive.ph</li>
              <li>0910 - 117 - 6684</li>
          </ul>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;
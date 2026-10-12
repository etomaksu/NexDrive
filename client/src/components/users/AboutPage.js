import React from 'react'
import { Card, Col, Dropdown, Row } from 'antd';

const AboutPage = () => {
  return ( //trygrr
    <div>
        <div classname="navbar-login">
            <h2 id="logo-name-2">NexDrive</h2>
            <nav></nav>
        </div>
            
        <div classname="about">
            <h1 id="hl-3">About NexDrive</h1>
            <p id="desc-3">A local car rental service based in Pasay City, Philippines.</p>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card title="Card title" variant="borderless">
                            Card content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Card title" variant="borderless">
                            Card content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Card title" variant="borderless">
                            Card content
                        </Card>
                    </Col>
                </Row>
        </div>

        <div classame="contact-us-form">
            <form>
                <h1 id="hl-4">Contact Us</h1>
                <div>
                    <label id="lbl-1">Name</label>
                    <input id="inpt-2" type="text" name="name" required/>
                </div>
                <div>
                    <label id="lbl-1">Email</label>
                    <input id="inpt-2" type="email" name="email" required/>
                </div>
                <label id="lbl-1">Message</label>
                <textarea id="txt-area-1" name="message" required></textarea>

                <button id="btn-3" type="submit">Send Message</button>
            </form>
        </div>

        <div classname="faq">
            <h1 id="hl-4">FAQs</h1>

                <details id="faq-1" open>
                    <summary id="faq-1-question">What do I need to rent a car?</summary>
                    <p id="faq-1-answer">A valid driver's license, a government ID and a payment method.</p>
                </details>

                <details id="faq-2">
                    <summary id="faq-2-question">Can I cancel or reschedule?</summary>
                    <p id="faq-2-answer">Yes, up to 48 hours before pickup.</p>
                </details>

                <details id="faq-3">
                    <summary id="faq-3-question">Is insurance included?</summary>
                    <p id="faq-3-answer">Basic coverage is included.</p>
                </details>

                <details id="faq-4">
                    <summary id="faq-4-question">Do you offer delivery?</summary>
                    <p id="faq-4-answer">Yes, within selected areas.</p>
                </details>
        </div>

        <footer id="footer">

            <div id="ftr-brand">
                <h3 id="logo-name-3">NexDrive</h3>
                <p id="desc-3">Car rental made simple.</p>
                <p id="desc-3">Figueroa St., Pasay City, Philippines</p>
            </div>

            <div id="ftr-company">
                <h4 id="sub-hl-1">Company</h4>
                    <ul id="links-1">
                        <li><a href="">About us</a></li>
                        <li><a href="">Contact</a></li>
                        <li><a href="">FAQs</a></li>
                    </ul>
            </div>

            <div id="ftr-fleet">
                <h4 id="sub-hl-1">Fleet</h4>
                    <ul id="links-1">
                        <li><a href="">SUVs</a></li>
                        <li><a href="">Sedans</a></li>
                        <li><a href="">Vans</a></li>
                        <li><a href="">Pickup</a></li>
                        <li><a href="">EV</a></li>
                    </ul>
            </div>

            <div id="ftr-support">
                <h4 id="sub-hl-1">Support</h4>
                    <ul id="links-1">
                        <li><a href="mailto:nexdrive@gmail.com">nexdrive@gmail.com</a></li>
                        <li><a href="tel:+639101176684">+63 910 117 6684</a></li>
                    </ul>
            </div>

        </footer>
    </div>
  )
}

export default AboutPage

// components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    {/* Company Info */}
                    <div className="footer-section">
                        <h3>Luxury Wood Furniture</h3>
                        <p>Handcrafted luxury furniture made from the finest sustainable materials. Creating beautiful pieces that last for generations.</p>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook">📘</a>
                            <a href="#" aria-label="Instagram">📷</a>
                            <a href="#" aria-label="Pinterest">📌</a>
                            <a href="#" aria-label="Twitter">🐦</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="footer-section">
                        <h4>Categories</h4>
                        <ul>
                            <li><Link to="/products?category=living">Living Room</Link></li>
                            <li><Link to="/products?category=dining">Dining Room</Link></li>
                            <li><Link to="/products?category=bedroom">Bedroom</Link></li>
                            <li><Link to="/products?category=office">Office</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <div className="contact-info">
                            <p>📧 hello@luxurywood.com</p>
                            <p>📞 +1 (555) 123-4567</p>
                            <p>📍 123 Furniture Street, Craftville, CA 90210</p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 Luxury Wood Furniture. All rights reserved.</p>
                    <div className="footer-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/shipping">Shipping Info</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
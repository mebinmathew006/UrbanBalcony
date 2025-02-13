import React from "react";
import { Link } from "react-router-dom";


const Footer = () => {
  const socialLinks = [
    { href: "https://facebook.com", icon: "fab fa-facebook", label: "Facebook" },
    { href: "https://instagram.com", icon: "fab fa-instagram", label: "Instagram" },
    { href: "https://linkedin.com", icon: "fab fa-linkedin", label: "LinkedIn" },
    { href: "https://whatsapp.com", icon: "fab fa-whatsapp", label: "WhatsApp" }
  ];

  return (
    <footer style={{ backgroundColor: '#401c08' }} className="pt-2 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Contact Section */}
          <div className="space-y-2">
            <h5 className="text-lg font-semibold mb-3">Contact</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Section */}
          <div className="space-y-2">
            <h5 className="text-lg font-semibold mb-3">Customer Service</h5>
            <ul className="space-y-2">
              {['FAQ', 'Shipping and Returns', 'Order Tracking', 'Size Guide'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200 no-underline"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Us Section */}
          <div className="space-y-2">
            <h5 className="text-lg font-semibold mb-3">About Us</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/our-story" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline">
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div className="space-y-2">
            <h5 className="text-lg font-semibold mb-3">Follow Us</h5>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Spice Forest. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 no-underline">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 no-underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

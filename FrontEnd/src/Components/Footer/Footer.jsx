import React from "react";
import { Link } from "react-router-dom";


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    { href: "https://facebook.com", icon: "fab fa-facebook", label: "Facebook" },
    { href: "https://instagram.com", icon: "fab fa-instagram", label: "Instagram" },
    { href: "https://linkedin.com", icon: "fab fa-linkedin", label: "LinkedIn" },
    { href: "https://whatsapp.com", icon: "fab fa-whatsapp", label: "WhatsApp" }
  ];
  
  return (
    <footer className="bg-gray-800 text-white">
      {/* Main Footer Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <img src="/spice new.png" alt="Logo" className="h-12 w-auto mb-4" />
            <p className="text-gray-300 mb-4">
              Premium quality spices sourced directly from farmers. We ensure the highest 
              standards of freshness and flavor in every package.
            </p>
            <div className="flex space-x-4 mt-4">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white"
        >
          <span className="sr-only">{link.label}</span>
          <i className={`${link.icon} text-xl`}></i>
        </a>
      ))}
    </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Shop
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Return & Refund
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
           
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Contact Info</h4>
              <p className="text-gray-400 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                +91 8078876693
              </p>
              <p className="text-gray-400 flex items-center mt-1">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                lushspices@gmail.com
              </p>
              <p className="text-gray-400 flex items-center mt-1">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              Thekkady P.O,Idukki (dist), Kerala
              </p>
            </div>
          </div>
        </div>
      </div>

      
      

      {/* Copyright */}
      <div className="bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center md:flex-row md:justify-between">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Spice Store. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition duration-150 ease-in-out">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition duration-150 ease-in-out">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition duration-150 ease-in-out">
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

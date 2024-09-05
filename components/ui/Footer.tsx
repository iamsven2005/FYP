import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-6 mt-auto w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="mb-6 md:mb-0">
            <h6 className="text-lg font-semibold text-white mb-4">NTUC</h6>
            <p className="text-sm">
              NTUC is committed to food quality, safety, and compliance, ensuring transparency and trust across the industry.
            </p>
          </div>

          {/* Useful Links */}
          <div className="mb-6 md:mb-0">
            <h6 className="text-lg font-semibold text-white mb-4">Useful Links</h6>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Services</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          {/* Products */}
          <div className="mb-6 md:mb-0">
            <h6 className="text-lg font-semibold text-white mb-4">Our Products</h6>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Product 1</a></li>
              <li><a href="#" className="hover:underline">Product 2</a></li>
              <li><a href="#" className="hover:underline">Product 3</a></li>
              <li><a href="#" className="hover:underline">Product 4</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-6 md:mb-0">
            <h6 className="text-lg font-semibold text-white mb-4">Contact Us</h6>
            <p className="text-sm mb-2">
              123 NTUC Road, Singapore, SG
            </p>
            <p className="text-sm mb-2">
              Email: info@ntuc.com
            </p>
            <p className="text-sm mb-2">
              Phone: +65 1234 5678
            </p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm">&copy; 2024 NTUC. All Rights Reserved.</p>
          <div className="mt-4 md:mt-0">
            <a href="https://facebook.com" className="text-gray-400 hover:text-gray-300 mx-2">
              <i className="fab fa-facebook-f"></i> Facebook
            </a>
            <a href="https://twitter.com" className="text-gray-400 hover:text-gray-300 mx-2">
              <i className="fab fa-twitter"></i> Twitter
            </a>
            <a href="https://linkedin.com" className="text-gray-400 hover:text-gray-300 mx-2">
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

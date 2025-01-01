import React from 'react'

function Footer() {
  return (
    <footer className="container-fluid"
        style={{ backgroundColor: "#1c3b5b", color: "#fff", padding: "20px 0" }}
      >
        <div >
          <div className="row">
            {/* Contact Section */}
            <div className="col-md-3">
              <h5>Contact</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="/" style={{ color: "#fff", textDecoration: "none" }}>
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    Contact us
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service Section */}
            <div className="col-md-3">
              <h5>Customer Service</h5>
              <ul className="list-unstyled">
                <li>
                  <a
                    href="/faq"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping-returns"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    Shipping and Returns
                  </a>
                </li>
                <li>
                  <a
                    href="/order-tracking"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    Order Tracking
                  </a>
                </li>
                <li>
                  <a
                    href="/size-guide"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    Size guide
                  </a>
                </li>
              </ul>
            </div>

            {/* About Us Section */}
            <div className="col-md-3">
              <h5>About Us</h5>
              <ul className="list-unstyled">
                <li>
                  <a
                    href="/faq"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping-returns"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    Shipping and Returns
                  </a>
                </li>
                <li>
                  <a
                    href="/order-tracking"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    Order Tracking
                  </a>
                </li>
                <li>
                  <a
                    href="/size-guide"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    Size guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us Section */}
            <div className="col-md-3">
              <h5>Follow Us</h5>
              <div className="d-flex">
                <a
                  href="https://facebook.com"
                  style={{
                    color: "#fff",
                    marginRight: "5px",
                    fontSize: "20px",
                  }}
                >
                  <i className="fab fa-facebook"></i>
                </a>
                <a
                  href="https://instagram.com"
                  style={{
                    color: "#fff",
                    marginRight: "5px",
                    fontSize: "20px",
                  }}
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://linkedin.com"
                  style={{
                    color: "#fff",
                    marginRight: "5px",
                    fontSize: "20px",
                  }}
                >
                  <i className="fab fa-linkedin"></i>
                </a>
                <a
                  href="https://whatsapp.com"
                  style={{ color: "#fff", fontSize: "20px" }}
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Footer

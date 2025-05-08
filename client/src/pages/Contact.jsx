import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from "react-icons/fa";
import "./Contact.css";
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  });
  
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.message.trim()) errors.message = "Message is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setFormStatus({ submitted: true, success: false, message: "Sending your message..." });
  
    try {
        await axios.post("http://localhost:5000/api/messages", formData);
      setFormStatus({
        submitted: true,
        success: true,
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => {
        setFormStatus({ submitted: false, success: false, message: "" });
      }, 5000);
    } catch (err) {
      setFormStatus({
        submitted: true,
        success: false,
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you! Contact us for inquiries about our products or partnership opportunities.</p>
      </div>

      <div className="contact-content">
        {/* Contact Information */}
        <div className="contact-info">
          <div className="info-card">
            <h2>Contact Information</h2>
            <p>Reach out to us using any of the following methods:</p>
            
            <div className="info-item">
              <div className="icon-wrapper">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h3>Address</h3>
                <p>36 Natesan Colony, Shankar Nagar, Salem-636007</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="icon-wrapper">
                <FaPhone />
              </div>
              <div>
                <h3>Phone</h3>
                <p>E. Ravi | <a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="icon-wrapper">
                <FaEnvelope />
              </div>
              <div>
                <h3>Email</h3>
                <p><a href="harithae.22cse@kongu.edu">jayagencies_1@yahoo.com</a></p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="icon-wrapper">
                <FaClock />
              </div>
              <div>
                <h3>Business Hours</h3>
                <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
          
          {/* Map */}
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15664.936555581615!2d78.1367!3d11.6618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf1ccf52cccad%3A0xfdc63b07c73f8175!2sShankar%20Nagar%2C%20Salem%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1683101779244!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Jay Agencies Location"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-container">
          <div className="form-card">
            <h2>Send Us a Message</h2>
            <p>Have questions or specific requirements? Fill out the form below, and we'll get back to you promptly.</p>
            
            {formStatus.submitted && (
              <div className={`form-status ${formStatus.success ? "success" : ""}`}>
                {formStatus.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className={formErrors.name ? "error" : ""}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className={formErrors.email ? "error" : ""}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your Phone (Optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="5"
                  className={formErrors.message ? "error" : ""}
                ></textarea>
                {formErrors.message && <span className="error-message">{formErrors.message}</span>}
              </div>
              
              <button type="submit" className="submit-btn">
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
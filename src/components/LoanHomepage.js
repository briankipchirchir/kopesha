import React, { useEffect, useState } from 'react';
import PhoneMockup from './PhoneMockup';
import LoanForm from './LoanForm';
import '../styles/LoanHomepage.css';
import { useNavigate } from "react-router-dom";

const LoanHomepage = () => {
  const [applications, setApplications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

  // Fetch latest 10 applications
  useEffect(() => {
    fetch("https://kopesa.onrender.com/api/loans/all")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => b.id - a.id).slice(0, 100);
        setApplications(sorted);
      })
      .catch(err => console.error("Error fetching loans:", err));
  }, []);

  // Rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (applications.length > 0) {
        setCurrentIndex(prev => (prev + 1) % applications.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [applications]);

  const currentApp = applications[currentIndex];

  return (
    <div className="loan-container">
      {/* Left Section */}
      <div className="loan-left-section">
        <div>
          <div className="loan-logo">
            <p>KOPESHA</p>
            <p>LOAN</p>
          </div>

          <PhoneMockup />

          <h1 className="loan-heading"          onClick={() => navigate("/admin-login")} // <-- admin login route
        style={{ cursor: "pointer" }} >Kopesha Loan</h1>
          <p className="loan-description">
            Let us help you sort your expenses - top up a loan, rental loan, car loan or emergencies
          </p>
        </div>

        {/* Rotating Transaction Card */}
        {currentApp && (
          <div className="transaction-card fade-transaction">
            <p className="transaction-name">
              {currentApp.name} {currentApp.phone.slice(0, 3)}xxx{currentApp.phone.slice(-3)}
            </p>

            <div className="transaction-amount">
              <span>Received Ksh.</span>
              <span className="amount-value">{currentApp.loanAmount.toLocaleString()}</span>
              <span className="loan-type">
                {currentApp.loanType.charAt(0).toUpperCase() + currentApp.loanType.slice(1)} Loan
              </span>
            </div>

            <p className="transaction-time">Just Now</p>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="loan-right-section">
        <LoanForm />
      </div>
    </div>
  );
};

export default LoanHomepage;

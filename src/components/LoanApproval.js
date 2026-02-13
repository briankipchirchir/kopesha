import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoanApproval.css';

const LoanApproval = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const loanApplication = location.state;
  const trackingId = loanApplication?.trackingId;

  const tillNumber = '123456'; // Replace with real PayBill

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
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [parsedAmount, setParsedAmount] = useState('');
  const [parsedPhone, setParsedPhone] = useState('');
  const [submitted, setSubmitted] = useState(false); // ✅ ADDED
  const [localTrackingId, setLocalTrackingId] = useState(''); // ✅ ADDED

  // 📋 Copy PayBill
  const copyTillNumber = () => {
    navigator.clipboard.writeText(tillNumber)
      .then(() => Swal.fire('Copied!', `PayBill number ${tillNumber} copied.`, 'success'))
      .catch(() => Swal.fire('Oops!', 'Could not copy till number.', 'error'));
  };

  useEffect(() => {
  if (!mpesaMessage) {
    setParsedAmount('');
    setParsedPhone('');
    return;
  }

  const amountMatch = mpesaMessage.match(/Ksh\s?([\d,.]+)/i);
  const phoneMatch = mpesaMessage.match(/(\+254|254|0)?7\d{8}/);

  setParsedAmount(amountMatch ? amountMatch[1].replace(/,/g, '') : '');
  setParsedPhone(phoneMatch ? phoneMatch[0] : '');
}, [mpesaMessage]);


  // ⬇ AUTO-SCROLL AFTER LOAN SELECTION
  useEffect(() => {
    if (selectedLoan) {
      document
        .querySelector('.payment-instructions')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedLoan]);

  // 📤 SUBMIT MESSAGE
  const handleSubmitMessage = async () => {
    try {
      const res = await fetch('https://kopesa.onrender.com/api/loans/verify-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId,
          mpesaMessage,
          phone: parsedPhone,
          amount: parsedAmount,
          loanAmount: selectedLoan.amount,
          verificationFee: selectedLoan.verificationFee,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit message');

      const generatedId = trackingId || `TRK-${Date.now()}`;
      setLocalTrackingId(generatedId);

      Swal.fire(
        'Success ✅',
        'Your M-Pesa message was submitted successfully.',
        'success'
      ).then(() => setSubmitted(true)); // ✅ SUCCESS STATE
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <div className="approval-container">
      <div className="approval-card">

        {/* 🔢 PROGRESS INDICATOR */}
        <div className="progress-steps">
          <span className="active">1. Select Loan</span>
          <span className="active">2. Pay Verification</span>
          <span>3. Approval</span>
        </div>

        <div className="approval-header">
          <h2>Kopesha Chapchap</h2>
          <p>Select a loan option and pay via M-Pesa PayBill</p>
        </div>

        {/* 💳 LOAN OPTIONS */}
        <div className="loan-options">
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
                Verification Fee: <strong>Ksh. {offer.verificationFee}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* 🧾 PAYMENT / SUCCESS */}
        {selectedLoan && (
          <div className="payment-instructions">
            {submitted ? (
              /* ✅ SUCCESS STATE UI */
              <div className="success-card">
                <h3>✅ Verification Submitted</h3>
                <p>
                  We’ve received your M-Pesa message.
                  Our team is reviewing it and you’ll be notified shortly.
                </p>
                <small>Tracking ID: {localTrackingId}</small>

                <button className="get-loan-btn" onClick={() => navigate('/')}>
                  Go Home
                </button>
              </div>
            ) : (
              <>
                <p>
                  Pay <strong>Ksh. {selectedLoan.verificationFee}</strong> via M-Pesa PayBill
                </p>

                <p>
                  <strong>Till Number:</strong> {tillNumber}
                  <button className="copy-btn" onClick={copyTillNumber}>Copy</button>
                </p>

                <textarea
                  placeholder="Paste the FULL M-Pesa confirmation SMS here (starts with 'Confirmed' or 'You have received…')"
                  value={mpesaMessage}
                  onChange={(e) => setMpesaMessage(e.target.value)}
                />

                {/* 🟢 / 🔴 PARSING FEEDBACK */}
                {mpesaMessage && !parsedAmount && (
                  <p className="parse-error">
                    ❌ Unable to read M-Pesa message. Please paste the full SMS.
                  </p>
                )}

                {parsedAmount && parsedPhone && (
                  <p className="parse-success">
                    ✔ Payment detected — Ksh {parsedAmount} from {parsedPhone}
                  </p>
                )}

                {/* 🚀 SMART BUTTON */}
                <button
                  className="get-loan-btn"
                  disabled={!parsedAmount || !parsedPhone}
                  onClick={handleSubmitMessage}
                >
                  Submit Verification Message
                </button>
              </>
            )}
          </div>
        )}

        <div className="footer-note">
          © Kopesha Chapchap 2026 | Regulated by KFSA
        </div>

      </div>
    </div>
  );
};

export default LoanApproval;

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LoanApproval.css';

const LoanApproval = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const isPollingRef = useRef(false);

  const formData = location.state || {};
  const trackingId = formData.trackingId || 'N/A';

  /* ---------------- LOAN OPTIONS ---------------- */
  const loanOffers = [
    {
      id: 1,
      amount: 2500,
      verificationFee: 150,
      duration: '2 months',
      interest: '10%',
    },
      {
      id: 2,
      amount: 5000,
      verificationFee: 250,
      duration: '2 months',
      interest: '10%',
    },
      {
      id: 3,
      amount: 10000,
      verificationFee: 350,
      duration: '2 months',
      interest: '10%',
    },
      {
      id: 4,
      amount: 20000,
      verificationFee: 500,
      duration: '2 months',
      interest: '10%',
    },
      {
      id: 5,
      amount: 30000,
      verificationFee: 750,
      duration: '2 months',
      interest: '10%',
    },
    {
      id: 6,
      amount: 40000,
      verificationFee: 850,
      duration: '3 months',
      interest: '12%',
    },
    {
      id: 7,
      amount: 50000,
      verificationFee: 1000,
      duration: '4 months',
      interest: '15%',
    },
  ];

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /* ---------------- HANDLE LOAN PAYMENT ---------------- */
  const handleGetLoan = async () => {
    if (!selectedLoan) {
      alert('Please select a loan option');
      return;
    }

    if (isPollingRef.current) return;

    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      isPollingRef.current = true;
      setIsLoading(true);
      setPaymentStatus('pending');

      const response = await fetch(
        'https://kopesha-backend-3.onrender.com/api/loans/stk-push',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId,
            phone: formData.phone,
            amount: selectedLoan.verificationFee,
          }),
        }
      );

      const data = JSON.parse(await response.text());
      const requestID = data.CheckoutRequestID;

      if (!requestID) {
        setPaymentStatus('failed');
        setIsLoading(false);
        isPollingRef.current = false;
        alert('STK Push initiated but no CheckoutRequestID received');
        return;
      }

      setCheckoutRequestID(requestID);

      let pollCount = 0;
      const maxPolls = 100;

      intervalRef.current = setInterval(async () => {
        pollCount++;

        try {
          const statusRes = await fetch(
            `https://kopesha-backend-3.onrender.com/api/loans/mpesa/status/${requestID}`
          );

          if (!statusRes.ok) return;

          const statusData = await statusRes.json();

          switch (statusData.status) {
            case 'PENDING':
              setPaymentStatus('pending');
              break;
            case 'success':
              setPaymentStatus('success');
              clearInterval(intervalRef.current);
              clearTimeout(timeoutRef.current);
              isPollingRef.current = false;
              setIsLoading(false);
              break;
            case 'CANCELLED':
              setPaymentStatus('cancelled');
              clearInterval(intervalRef.current);
              clearTimeout(timeoutRef.current);
              isPollingRef.current = false;
              setIsLoading(false);
              break;
            case 'FAILED':
              setPaymentStatus('failed');
              clearInterval(intervalRef.current);
              clearTimeout(timeoutRef.current);
              isPollingRef.current = false;
              setIsLoading(false);
              break;
            default:
              break;
          }
        } catch (err) {
          console.error('Status check error:', err);
        }

        if (pollCount >= maxPolls) {
          setPaymentStatus('timeout');
          clearInterval(intervalRef.current);
          isPollingRef.current = false;
          setIsLoading(false);
        }
      }, 3000);

      timeoutRef.current = setTimeout(() => {
        clearInterval(intervalRef.current);
        setPaymentStatus('timeout');
        isPollingRef.current = false;
        setIsLoading(false);
      }, 300000);

    } catch (error) {
      console.error('STK Push error:', error);
      setPaymentStatus('failed');
      setIsLoading(false);
      isPollingRef.current = false;
    }
  };

  /* ---------------- AUTO CLEAR STATUS ---------------- */
  useEffect(() => {
    if (paymentStatus && paymentStatus !== 'pending') {
      const timer = setTimeout(() => setPaymentStatus(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handleGoBack = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    navigate('/');
  };

  const renderStatusMessage = () => {
    switch (paymentStatus) {
      case 'pending':
        return <p>Waiting for payment... (STK prompt sent)</p>;
      case 'success':
        return <p style={{ color: 'green' }}>Payment Successful ✅ Loan processing started.</p>;
      case 'cancelled':
        return <p style={{ color: 'red' }}>Payment Cancelled ❌</p>;
      case 'timeout':
        return <p style={{ color: 'orange' }}>Request Timeout</p>;
      case 'failed':
        return <p style={{ color: 'red' }}>Payment Failed ❌</p>;
      default:
        return null;
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="approval-container">
      <div className="approval-card">

        <div className="approval-header">
          <p>
            Hi {formData.name || 'User'}, select a loan option below.
            Terms and conditions apply.
          </p>
        </div>

        <div className="approval-body">

          {/* -------- LOAN OPTIONS -------- */}
          <div className="loan-options">
            <h4>Select a loan option</h4>

            {loanOffers.map((offer) => (
              <div
                key={offer.id}
                className={`loan-option-card ${
                  selectedLoan?.id === offer.id ? 'selected' : ''
                }`}
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

          {/* -------- SUMMARY -------- */}
          <div className="approval-table">
            <div className="approval-row">
              <span className="approval-label">Loan Tracking ID:</span>
              <span className="approval-value">{trackingId}</span>
            </div>

            <div className="approval-row">
              <span className="approval-label">MPESA Number:</span>
              <span className="approval-value">{formData.phone || 'N/A'}</span>
            </div>

            <div className="approval-row">
              <span className="approval-label">Selected Loan:</span>
              <span className="approval-value">
                {selectedLoan ? `Ksh. ${selectedLoan.amount.toLocaleString()}` : 'None'}
              </span>
            </div>

            <div className="approval-row">
              <span className="approval-label">Verification Fee:</span>
              <span className="approval-value">
                {selectedLoan ? `Ksh. ${selectedLoan.verificationFee}` : '-'}
              </span>
            </div>
          </div>

          <div className="approval-footer">
            {renderStatusMessage()}

            <button
              onClick={handleGetLoan}
              className="get-loan-btn"
              disabled={isLoading || !selectedLoan || paymentStatus === 'success'}
            >
              {isLoading ? 'Processing...' : 'Get Loan Now'}
            </button>

            <div className="approval-footer-text">
              © 2025. All rights reserved. Go back{' '}
              <span onClick={handleGoBack} style={{ cursor: 'pointer' }}>home</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoanApproval;


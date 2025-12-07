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
  const loanAmount = formData.loanAmount || 0;
  const verificationFee = formData.verificationFee || 0;
  const trackingId = formData.trackingId || 'N/A';

  const [paymentStatus, setPaymentStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleGetLoan = async () => {
    if (isPollingRef.current) return; // Prevent multiple calls

    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      isPollingRef.current = true;
      setIsLoading(true);
      setPaymentStatus('pending');

      // Initiate STK Push
      const response = await fetch('https://kopesha-backend-3.onrender.com/api/loans/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: trackingId,
          phone: formData.phone,
          amount: verificationFee,
        }),
      });

      const dataText = await response.text();
      const data = JSON.parse(dataText);
      const requestID = data.CheckoutRequestID;

      if (!requestID) {
        setPaymentStatus('failed');
        setIsLoading(false);
        isPollingRef.current = false;
        alert('STK Push initiated, but no CheckoutRequestID received.');
        return;
      }

      setCheckoutRequestID(requestID);

      // Small delay to ensure backend saved PENDING status
      await new Promise(res => setTimeout(res, 500));

      console.log('Starting to poll for:', requestID);

      let pollCount = 0;
      const maxPolls = 100; // 5 minutes max

      intervalRef.current = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await fetch(
            `https://kopesha-backend-3.onrender.com/api/loans/mpesa/status/${requestID}`
          );

          if (!statusRes.ok) return;

          const statusData = await statusRes.json();
          console.log('Status response:', statusData);

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
          console.error('Error checking payment status:', err);
        }

        if (pollCount >= maxPolls) {
          console.warn('Max polling attempts reached');
          setPaymentStatus('timeout');
          clearInterval(intervalRef.current);
          isPollingRef.current = false;
          setIsLoading(false);
        }
      }, 3000);

      // Timeout after 5 minutes
      timeoutRef.current = setTimeout(() => {
        console.warn('Polling timeout reached');
        clearInterval(intervalRef.current);
        setPaymentStatus('timeout');
        isPollingRef.current = false;
        setIsLoading(false);
      }, 300000); // 5 minutes

    } catch (error) {
      console.error('Error initiating STK Push:', error);
      setPaymentStatus('failed');
      setIsLoading(false);
      isPollingRef.current = false;
    }
  };



useEffect(() => {
  if (paymentStatus && paymentStatus !== 'pending') {
    const timer = setTimeout(() => {
      setPaymentStatus('');
    }, 5000); 

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
        return <p>Waiting for payment... (STK prompt sent to your phone)</p>;
      case 'success':
        return <p style={{ color: 'green' }}>Payment Successful ✅ Your loan will be processed within 24 hours.</p>;
      case 'cancelled':
        return <p style={{ color: 'red' }}>Payment Cancelled by user❌</p>;
      case 'timeout':
        return <p style={{ color: 'orange' }}>Request Timeout - Please try again</p>;
      case 'failed':
        return <p style={{ color: 'red' }}>Payment Failed ❌</p>;
      default:
        return null;
    }
  };

  return (
    <div className="approval-container">
      <div className="approval-card">
        <div className="approval-header">
          <p>
            Hi {formData.name || 'User'}, you have qualified for a Loan of Ksh. {loanAmount.toLocaleString()}.
            Your loan repayment period is 2 months with a 10% interest rate. Terms and conditions apply.
          </p>
        </div>

        <div className="approval-body">
          <div className="approval-table">
            <div className="approval-row">
              <span className="approval-label">Loan Tracking ID:</span>
              <span className="approval-value">{trackingId}</span>
            </div>
            <div className="approval-row">
              <span className="approval-label">Your Name:</span>
              <span className="approval-value">{formData.name || 'N/A'}</span>
            </div>
            <div className="approval-row">
              <span className="approval-label">MPESA Number:</span>
              <span className="approval-value">{formData.phone || 'N/A'}</span>
            </div>
            <div className="approval-row">
              <span className="approval-label">ID Number:</span>
              <span className="approval-value">{formData.idNumber || 'N/A'}</span>
            </div>
            <div className="approval-row">
              <span className="approval-label">Loan Type:</span>
              <span className="approval-value">{formData.loanType || 'N/A'}</span>
            </div>
            <div className="approval-row">
              <span className="approval-label">Qualified Loan:</span>
              <span className="approval-value">Ksh. {loanAmount.toLocaleString()}</span>
            </div>
            <div className="approval-row">
              <span className="approval-label">Verification Fee:</span>
              <span className="approval-value">Ksh. {verificationFee}</span>
            </div>
          </div>

          <div className="approval-footer">
            {renderStatusMessage()}

            <button
              onClick={handleGetLoan}
              className="get-loan-btn"
              disabled={isLoading || paymentStatus === 'success'}
            >
              {isLoading ? 'Processing...' : 'Get Loan Now'}
            </button>

            <div className="approval-footer-text">
              © 2025. All rights reserved. Go back{' '}
              <a onClick={handleGoBack} style={{ cursor: 'pointer' }}>home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApproval;

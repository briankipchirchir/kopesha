import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://kopesha-backend-3.onrender.com/api/loans/all")
      .then(res => res.json())
      .then(data => {
        setLoans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching loans:", err);
        setLoading(false);
      });
  }, []);

  // Calculate totals - Only count PAID loans
  const calculateTotals = () => {
    const paidLoans = loans.filter(loan => loan.status === "PAID");
    
    const totalVerificationFees = paidLoans.reduce((sum, loan) => sum + (loan.verificationFee || 0), 0);
    const totalLoanAmount = paidLoans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
    const successfulPayments = paidLoans.length;

    return {
      totalVerificationFees,
      totalLoanAmount,
      successfulPayments,
      totalApplications: loans.length
    };
  };

  if (loading) return <h2 className="loading">Loading loan applications...</h2>;

  const { totalVerificationFees, totalLoanAmount, successfulPayments, totalApplications } = calculateTotals();

  return (
    <div className="admin-container">
      <h2 className="dashboard-title">Loan Applications Dashboard</h2>
      
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-label">Total Applications</div>
          <div className="summary-value">{totalApplications}</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-label">Successful Payments</div>
          <div className="summary-value" style={{ color: '#28a745' }}>{successfulPayments}</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-label">Total Verification Fees Paid</div>
          <div className="summary-value" style={{ color: '#007bff' }}>Ksh {totalVerificationFees.toLocaleString()}</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-label">Total Loan Amount Qualified</div>
          <div className="summary-value" style={{ color: '#ffc107' }}>Ksh {totalLoanAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="loan-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>ID Number</th>
              <th>Loan Type</th>
              <th>Amount</th>
              <th>Verification Fee</th>
              <th>Status</th>
              <th>Tracking ID</th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.name}</td>
                <td>{loan.phone}</td>
                <td>{loan.idNumber}</td>
                <td>{loan.loanType}</td>
                <td>Ksh {loan.loanAmount.toLocaleString()}</td>
                <td>Ksh {loan.verificationFee}</td>
                <td>
                  <span className={`status ${loan.status.toLowerCase()}`}>
                    {loan.status}
                  </span>
                </td>
                <td>{loan.trackingId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
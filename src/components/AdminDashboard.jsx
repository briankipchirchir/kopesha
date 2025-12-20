import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
const [loansPerPage] = useState(10); // Show 10 loans per page


const indexOfLastLoan = currentPage * loansPerPage;
const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
const currentLoans = loans.slice(indexOfFirstLoan, indexOfLastLoan);


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

const handleDelete = async (trackingId) => {
  if (!window.confirm("Are you sure you want to delete this loan?")) return;

  // Replace System.out.println with console.log
  console.log("Deleting: " + trackingId);

  // Remove or replace loanOptional logic; if you just want to log, you can do:
  const loanFound = loans.find(loan => loan.trackingId === trackingId);
  console.log("Found loan?", !!loanFound);

  try {
    const res = await fetch(`https://kopesha-backend-3.onrender.com/api/loans/delete/${trackingId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Loan ${trackingId} deleted successfully`);
      setLoans(loans.filter(loan => loan.trackingId !== trackingId));
    } else {
      alert(data.error || "Failed to delete loan");
    }
  } catch (err) {
    console.error("Error deleting loan:", err);
    alert("Error deleting loan. Check console.");
  }
};

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

  const totalPages = Math.ceil(loans.length / loansPerPage);
  const goToPage = (pageNumber) => {
  setCurrentPage(pageNumber);
};



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
            
              <th>Amount</th>
              <th>Verification Fee</th>
              <th>Status</th>
            
               <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentLoans.map((loan) => (
  <tr key={loan.id}>
    <td>{loan.id}</td>
    <td>{loan.name}</td>
    <td>{loan.phone}</td>
    <td>{loan.idNumber}</td>
    
    <td>Ksh {loan.loanAmount.toLocaleString()}</td>
    <td>Ksh {loan.verificationFee}</td>
    <td>
      <span className={`status ${loan.status.toLowerCase()}`}>
        {loan.status}
      </span>
    </td>
    
    <td>
      <button
        className="delete-btn"
        onClick={() => handleDelete(loan.trackingId)}
      >
        Delete
      </button>
    </td>
  </tr>
))}

          </tbody>
        </table>

        <div className="pagination">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    Prev
  </button>

  {[...Array(totalPages)].map((_, index) => (
    <button
      key={index}
      className={currentPage === index + 1 ? "active" : ""}
      onClick={() => goToPage(index + 1)}
    >
      {index + 1}
    </button>
  ))}

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    Next
  </button>
</div>

      </div>

      
    </div>
  );
}
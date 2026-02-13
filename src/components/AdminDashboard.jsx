import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // ------------------- Loans Pagination -------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [loansPerPage] = useState(10);

  // ------------------- Loans Filters -------------------
  const [selectedDate, setSelectedDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ------------------- Messages Pagination & Filters -------------------
  const [messagePage, setMessagePage] = useState(1);
  const [messagesPerPage] = useState(8);

  const [messageFilterType, setMessageFilterType] = useState("all");
  const [messageDate, setMessageDate] = useState("");
  const [messageStartDate, setMessageStartDate] = useState("");
  const [messageEndDate, setMessageEndDate] = useState("");

  const prevLastMessageId = useRef(null);

  // ------------------- Fetch Loans -------------------
  useEffect(() => {
    fetch("https://kopesa.onrender.com/api/loans/all")
      .then((res) => res.json())
      .then((data) => {
        setLoans(data);
        setLoadingLoans(false);
      })
      .catch((err) => {
        console.error("Error fetching loans:", err);
        setLoadingLoans(false);
      });
  }, []);

  // ------------------- Fetch Messages -------------------
  const fetchMessages = async () => {
    try {
      const res = await fetch("https://kopesa.onrender.com/api/messages/all");
      const data = await res.json();
      setMessages(data);

      // Show alert if new message arrived
      const lastMessageId = data[data.length - 1]?.id;
      if (lastMessageId && lastMessageId !== prevLastMessageId.current) {
        if (prevLastMessageId.current !== null) {
          Swal.fire("New Message Received", "A user just sent a message", "info");
        }
        prevLastMessageId.current = lastMessageId;
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  // ------------------- Loans Filtering -------------------
  const getFilteredLoans = () => {
    if (filterType === "all") return loans;

    return loans.filter((loan) => {
      if (!loan.applicationDate) return false;
      const loanDate = new Date(loan.applicationDate);
      loanDate.setHours(0, 0, 0, 0);

      if (filterType === "specific") {
        if (!selectedDate) return true;
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        return loanDate.getTime() === selected.getTime();
      }

      if (filterType === "range") {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return loanDate >= start && loanDate <= end;
      }

      return true;
    });
  };

  const filteredLoans = getFilteredLoans();
  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  const totalPages = Math.ceil(filteredLoans.length / loansPerPage);

  const resetLoanFilters = () => {
    setFilterType("all");
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const calculateTotals = () => {
    const paidLoans = filteredLoans.filter((loan) => loan.status === "PAID");
    return {
      totalVerificationFees: paidLoans.reduce((sum, loan) => sum + (loan.verificationFee || 0), 0),
      totalLoanAmount: paidLoans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0),
      successfulPayments: paidLoans.length,
      totalApplications: filteredLoans.length,
    };
  };

  const handleDelete = async (trackingId) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;

    try {
      const res = await fetch(`https://kopesa.onrender.com/api/loans/delete/${trackingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        alert(`Loan ${trackingId} deleted successfully`);
        setLoans(loans.filter((loan) => loan.trackingId !== trackingId));
      } else {
        alert(data.error || "Failed to delete loan");
      }
    } catch (err) {
      console.error("Error deleting loan:", err);
      alert("Error deleting loan. Check console.");
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "PAID": return "Paid ✔";
      case "CANCELLED": return "Cancelled by User";
      case "FAILED": return "Failed ❌";
      case "PENDING": return "Awaiting Payment";
      default: return "Unknown";
    }
  };

  const { totalVerificationFees, totalLoanAmount, successfulPayments, totalApplications } = calculateTotals();

  // ------------------- Messages Filtering -------------------
  const getFilteredMessages = () => {
    if (messageFilterType === "all") return messages;

    return messages.filter((msg) => {
      if (!msg.timestamp) return false;
      const msgDate = new Date(msg.timestamp);
      msgDate.setHours(0, 0, 0, 0);

      if (messageFilterType === "specific") {
        if (!messageDate) return true;
        const selected = new Date(messageDate);
        selected.setHours(0, 0, 0, 0);
        return msgDate.getTime() === selected.getTime();
      }

      if (messageFilterType === "range") {
        if (!messageStartDate || !messageEndDate) return true;
        const start = new Date(messageStartDate);
        const end = new Date(messageEndDate);
        end.setHours(23, 59, 59, 999);
        return msgDate >= start && msgDate <= end;
      }

      return true;
    });
  };

  const filteredMessages = getFilteredMessages();
  const indexOfLastMessage = messagePage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const messageTotalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  const totalMessageAmount = filteredMessages.reduce(
    (sum, msg) => sum + (msg.amount || 0),
    0
  );

  if (loadingLoans || loadingMessages) return <h2 className="loading">Loading dashboard...</h2>;

  return (
    <div className="admin-container">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      {/* -------- Loan Summary -------- */}
      <div className="summary-section">
        <div className="summary-card"><div>Total Applications</div><div>{totalApplications}</div></div>
        <div className="summary-card"><div>Successful Payments</div><div style={{color:'#28a745'}}>{successfulPayments}</div></div>
        <div className="summary-card"><div>Total Verification Fees Paid</div><div style={{color:'#007bff'}}>Ksh {totalVerificationFees.toLocaleString()}</div></div>
        <div className="summary-card"><div>Total Loan Amount Qualified</div><div style={{color:'#ffc107'}}>Ksh {totalLoanAmount.toLocaleString()}</div></div>
      </div>

      <button className="reset-btn" onClick={resetLoanFilters}>Reset Loan Filters</button>


      {/* -------- Loan Table -------- */}
      <div className="table-wrapper">
        <table className="loan-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Phone</th><th>ID Number</th>
              <th>Amount</th><th>Verification Fee</th><th>Status</th><th>Date Applied</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentLoans.length > 0 ? currentLoans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.name}</td>
                <td>{loan.phone}</td>
                <td>{loan.idNumber}</td>
                <td>Ksh {loan.loanAmount.toLocaleString()}</td>
                <td>Ksh {loan.verificationFee}</td>
                <td><span className={`status ${(loan.status||"pending").toLowerCase()}`}>{formatStatus(loan.status)}</span></td>
                <td>{loan.applicationDate ? new Date(loan.applicationDate).toLocaleString('en-KE',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : 'N/A'}</td>
                <td><button className="delete-btn" onClick={() => handleDelete(loan.trackingId)}>Delete</button></td>
              </tr>
            )) : <tr><td colSpan="9" style={{textAlign:'center',padding:'20px'}}>No applications found</td></tr>}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage===1} onClick={()=>setCurrentPage(currentPage-1)}>Prev</button>
            {[...Array(totalPages)].map((_,index)=>(
              <button key={index} className={currentPage===index+1?"active":""} onClick={()=>setCurrentPage(index+1)}>{index+1}</button>
            ))}
            <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(currentPage+1)}>Next</button>
          </div>
        )}
      </div>

      {/* -------- User Messages -------- */}
      <h3>User Messages</h3>

      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-label">Total Messages</div>
          <div className="summary-value">{filteredMessages.length}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Total Amount From Messages</div>
          <div className="summary-value" style={{ color: "#28a745" }}>
            Ksh {totalMessageAmount.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <h3>Filter Messages</h3>
          <button
            className="reset-btn"
            onClick={() => {
              setMessageFilterType("all");
              setMessageDate("");
              setMessageStartDate("");
              setMessageEndDate("");
              setMessagePage(1);
            }}
          >
            Reset
          </button>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Filter Type</label>
            <select
              value={messageFilterType}
              onChange={(e) => setMessageFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="specific">Specific Date</option>
              <option value="range">Date Range</option>
            </select>
          </div>

          {messageFilterType === "specific" && (
            <div className="filter-group">
              <label>Date</label>
              <input
                type="date"
                value={messageDate}
                onChange={(e) => setMessageDate(e.target.value)}
              />
            </div>
          )}

          {messageFilterType === "range" && (
            <>
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={messageStartDate}
                  onChange={(e) => setMessageStartDate(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={messageEndDate}
                  onChange={(e) => setMessageEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="loan-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Phone</th>
              <th>Amount (Ksh)</th>
              <th>Message</th>
              <th>Received At</th>
            </tr>
          </thead>
          <tbody>
            {currentMessages.length > 0 ? (
              currentMessages.map((msg) => (
                <tr key={msg.id}>
                  <td>{msg.id}</td>
                  <td>{msg.phone || "N/A"}</td>
                  <td style={{ fontWeight: "bold", color: "#28a745" }}>
                    {msg.amount ? msg.amount.toLocaleString() : "N/A"}
                  </td>
                  <td style={{ maxWidth: "350px", whiteSpace: "normal" }}>
                    {msg.content}
                  </td>
                  <td>
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleString("en-KE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No messages received yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {messageTotalPages > 1 && (
          <div className="pagination">
            <button disabled={messagePage === 1} onClick={() => setMessagePage(messagePage - 1)}>Prev</button>
            {[...Array(messageTotalPages)].map((_, index) => (
              <button key={index} className={messagePage === index + 1 ? "active" : ""} onClick={() => setMessagePage(index + 1)}>{index + 1}</button>
            ))}
            <button disabled={messagePage === messageTotalPages} onClick={() => setMessagePage(messagePage + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

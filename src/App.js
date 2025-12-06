import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoanHomepage from './components/LoanHomepage';
import LoanApproval from './components/LoanApproval';
import AdminDashboard from './components/AdminDashboard';

function App() {
 return (
    <Router>
      <Routes>
        <Route path="/" element={<LoanHomepage />} />
        <Route path="/approval" element={<LoanApproval />} />
        <Route path="/admin" element={<AdminDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;

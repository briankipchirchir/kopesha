import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoanHomepage from './components/LoanHomepage';
import LoanApproval from './components/LoanApproval';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
 return (
    <Router>
      <Routes>
        <Route path="/" element={<LoanHomepage />} />
        <Route path="/approval" element={<LoanApproval />} />
         <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

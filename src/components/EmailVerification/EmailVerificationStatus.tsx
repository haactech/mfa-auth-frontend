import React from 'react';
import '../../styles/email-status.css';

interface EmailVerificationStatusProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({
  email,
  onBackToLogin
}) => {
  return (
    <div className="email-verification">
      <div className="email-verification-content">
        <div className="email-verification-icon">
          ✉️
        </div>
        
        <h2>Check Your Email</h2>
        
        <div className="email-verification-message">
          <p>
            We've sent a verification link to:
            <br />
            <span className="email-highlight">{email}</span>
          </p>
          
          <p className="verification-instructions">
            Please check your inbox and click the verification link to activate your account.
            The link will expire in 24 hours.
          </p>
        </div>

        <div className="verification-actions">
          <button 
            className="back-to-login-button"
            onClick={onBackToLogin}
          >
            Back to Login
          </button>
        </div>

        <div className="verification-help">
          <p>Didn't receive the email?</p>
          <ul>
            <li>Check your spam folder</li>
            <li>Make sure the email address is correct</li>
            <li>
              Try logging in again if you need a new verification link
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
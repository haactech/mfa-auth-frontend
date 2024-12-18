import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AuthResponse } from '../types/auth';

interface MFAVerificationProps {
  onVerificationSuccess: (response: AuthResponse) => void;
}

export const MFAVerification = ({ onVerificationSuccess }: MFAVerificationProps) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.verifyMFA(token);
      onVerificationSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mfa-verification-container">
      <h2>Two-Factor Authentication Required</h2>
      <p>Please enter the verification code from your authenticator app.</p>
      
      <form onSubmit={handleSubmit} className="mfa-form">
        <div className="form-group">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={6}
            pattern="\d{6}"
            required
            placeholder="Enter 6-digit code"
            disabled={isLoading}
            className="verification-input"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          disabled={isLoading || token.length !== 6}
          className="verify-button"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
    </div>
  );
};
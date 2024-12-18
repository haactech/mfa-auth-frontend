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
    try {
      const response = await authService.verifyMFA(token);
      onVerificationSuccess(response);
    } catch (err) {
      setError('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mfa-form">
      <div className="form-group">
        <label htmlFor="token">Enter Verification Code</label>
        <input
          type="text"
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          pattern="[0-9]*"
          inputMode="numeric"
          maxLength={6}
          disabled={isLoading}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  );
};
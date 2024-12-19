import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';

interface EmailVerificationHandlerProps {
  token: string;
  onVerificationComplete: () => void;
}

export const EmailVerificationHandler: React.FC<EmailVerificationHandlerProps> = ({
  token,
  onVerificationComplete
}) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setTimeout(onVerificationComplete, 2000); // Redirigir después de 2 segundos
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [token, onVerificationComplete]);

  if (status === 'verifying') {
    return (
      <div className="verification-handler">
        <h2>Verifying your email...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="verification-handler error">
        <h2>Verification Failed</h2>
        <p>{error}</p>
        <button onClick={onVerificationComplete}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="verification-handler success">
      <h2>Email Verified Successfully!</h2>
      <p>Redirecting to login...</p>
    </div>
  );
};
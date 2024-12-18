import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './MFASetup.css'

interface MFASetupProps {
  onSetupComplete: () => void;
  onSetupCancel: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onSetupComplete, onSetupCancel }) => {
  const [setupData, setSetupData] = useState<{
    qr_code: string;
    manual_entry_key: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [showManualKey, setShowManualKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const response = await authService.setupMFA();
        setSetupData(response);
      } catch (err) {
        setError('Failed to initialize MFA setup');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Aquí iría la llamada a la verificación del código MFA
      // await authService.verifyMFASetup(verificationCode);
      onSetupComplete();
    } catch (err) {
      setError('Invalid verification code');
    }
  };

  if (isLoading) {
    return <div className="mfa-setup-loading">Loading MFA setup...</div>;
  }

  if (!setupData) {
    return <div className="mfa-setup-error">Failed to load MFA setup</div>;
  }

  return (
    <div className="mfa-setup-container">
      <h2>Set Up Two-Factor Authentication</h2>
      
      <div className="mfa-setup-steps">
        <div className="mfa-setup-step">
          <h3>1. Scan QR Code</h3>
          <p>Open Google Authenticator and scan this QR code:</p>
          <div className="qr-code-container">
            <img 
              src={`data:image/png;base64,${setupData.qr_code}`} 
              alt="MFA QR Code"
              className="qr-code-image"
            />
          </div>
          
          <button 
            className="manual-key-toggle"
            onClick={() => setShowManualKey(!showManualKey)}
          >
            {showManualKey ? 'Hide Manual Key' : "Can't scan? Use manual key"}
          </button>

          {showManualKey && (
            <div className="manual-key-section">
              <p>Manual entry key:</p>
              <code className="manual-key">{setupData.manual_entry_key}</code>
            </div>
          )}
        </div>

        <div className="mfa-setup-step">
          <h3>2. Enter Verification Code</h3>
          <p>Enter the 6-digit code from Google Authenticator:</p>
          
          <form onSubmit={handleVerification} className="verification-form">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              required
              className="verification-input"
            />
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="mfa-setup-actions">
              <button type="submit" className="verify-button">
                Verify & Enable
              </button>
              <button 
                type="button" 
                onClick={onSetupCancel}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
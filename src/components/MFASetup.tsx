import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './MFASetup.css'

interface MFASetupProps {
  onSetupComplete: () => void;
  onSetupCancel: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ 
  onSetupComplete, 
  onSetupCancel 
}) => {
  const [setupData, setSetupData] = useState<{
    qr_code: string;
    manual_entry_key: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [showManualKey, setShowManualKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const response = await authService.setupMFA();
        setSetupData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize MFA setup');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const response = await authService.verifyMFASetup(verificationCode);
      if (response.is_verified) {
        setBackupCodes(response.backup_codes || []);
        setSetupComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = () => {
    onSetupComplete();
  };

  if (isLoading) {
    return <div className="mfa-setup-loading">Loading MFA setup...</div>;
  }

  if (!setupData) {
    return <div className="mfa-setup-error">Failed to load MFA setup</div>;
  }

  if (setupComplete) {
    return (
      <div className="mfa-setup-success">
        <h3>MFA Setup Complete!</h3>
        <div className="backup-codes-container">
          <p>Please save these backup codes in a secure location:</p>
          <div className="backup-codes-grid">
            {backupCodes.map((code, index) => (
              <div key={index} className="backup-code">{code}</div>
            ))}
          </div>
          <p className="warning">
            These codes will not be shown again. Store them safely!
          </p>
        </div>
        <button 
          onClick={handleComplete}
          className="complete-button"
        >
          Complete Setup
        </button>
      </div>
    );
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
            type="button"
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
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              required
              className="verification-input"
              disabled={isVerifying}
            />
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="mfa-setup-actions">
              <button 
                type="submit" 
                className="verify-button"
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Enable'}
              </button>
              <button 
                type="button" 
                onClick={onSetupCancel}
                className="cancel-button"
                disabled={isVerifying}
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
import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { MFAVerification } from './components/MFAVerification';
import { MFASetup } from './components/MFASetup';
import { authService } from './services/authService';
import type { AuthResponse, AuthState } from './types/auth';
import './styles/auth.css';
import './App.css';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: authService.isAuthenticated(),
    requiresMFA: false,
    showMFASetup: false
  });

  const handleLoginSuccess = (response: AuthResponse) => {
    console.log('Login response:', response);
    console.log('Tokens before setState:', localStorage.getItem('access_token'));
    if (response.requires_mfa) {
      setAuthState({
        isAuthenticated: false,
        requiresMFA: true,
        showMFASetup: false,
        sessionId: response.tokens?.access,
        user: response.user
      });
    } else {
      setAuthState({
        isAuthenticated: true,
        requiresMFA: false,
        showMFASetup: false,
        user: response.user
      });
    }
  };

  const handleMFASuccess = (response: AuthResponse) => {
    setAuthState({
      isAuthenticated: true,
      requiresMFA: false,
      showMFASetup: false,
      user: response.user
    });
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      requiresMFA: false,
      showMFASetup: false
    });
  };

  const renderAuthContent = () => {
    if (authState.isAuthenticated) {
      return (
        <div className="welcome-container">
          <h2>Welcome, {authState.user?.username}!</h2>
          {!authState.user?.is_mfa_enabled && !authState.showMFASetup && (
            <div className="mfa-setup-prompt">
              <p>Your account is not secured with 2FA.</p>
              <button
                onClick={() => setAuthState(prev => ({
                  ...prev,
                  showMFASetup: true
                }))}
              >
                Setup 2FA Now
              </button>
            </div>
          )}
          {authState.showMFASetup && (
            <MFASetup
              onSetupComplete={() => {
                setAuthState(prev => ({
                  ...prev,
                  showMFASetup: false,
                  user: prev.user ? { ...prev.user, is_mfa_enabled: true } : undefined
                }));
              }}
              onSetupCancel={() => setAuthState(prev => ({
                ...prev,
                showMFASetup: false
              }))}
            />
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      );
    }

    if (authState.requiresMFA) {
      return (
        <div className="mfa-container">
          <h2>Two-Factor Authentication</h2>
          <MFAVerification
            sessionId={authState.sessionId || ''}
            onVerificationSuccess={handleMFASuccess}
          />
        </div>
      );
    }

    return (
      <div className="login-container">
        <h2>Login</h2>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MFA Authentication Demo</h1>
      </header>
      <main className="app-main">
        {renderAuthContent()}
      </main>
    </div>
  );
}

export default App;
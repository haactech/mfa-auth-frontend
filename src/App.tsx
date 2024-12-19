import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { EmailVerificationStatus } from './components/EmailVerification/EmailVerificationStatus';
import { EmailVerificationHandler } from './components/EmailVerification/EmailVerificationHandler';
import { MFAVerification } from './components/MFAVerification';
import { MFASetup } from './components/MFASetup';
import { authService } from './services/authService';
import type { AuthResponse, AuthState } from './types/auth';
import './styles/auth.css';
import './App.css';

type SignupState = {
  isSigningUp: boolean;
  pendingVerification: boolean;
  verificationEmail?: string;
};

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: authService.isAuthenticated(),
    requiresMFA: false,
    showMFASetup: false
  });

  const [signupState, setSignupState] = useState<SignupState>({
    isSigningUp: false,
    pendingVerification: false
  });

  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setVerificationToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleVerificationComplete = () => {
    setVerificationToken(null);
    setSignupState({
      isSigningUp: false,
      pendingVerification: false
    });
  };


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

  const handleSignupClick = () => {
    setSignupState({
      isSigningUp: true,
      pendingVerification: false
    });
  };

  const handleSignupSuccess = (email: string) => {
    setSignupState({
      isSigningUp: false,
      pendingVerification: true,
      verificationEmail: email
    });
  };

  const handleBackToLogin = () => {
    setSignupState({
      isSigningUp: false,
      pendingVerification: false,
      verificationEmail: undefined
    });
  };

  const renderAuthContent = () => {
    // Si el usuario está autenticado, mostrar el contenido principal
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

    if (verificationToken) {
      return (
        <EmailVerificationHandler
          token={verificationToken}
          onVerificationComplete={handleVerificationComplete}
        />
      );
    }

    // Si se requiere MFA, mostrar la verificación
    if (authState.requiresMFA) {
      return (
        <div className="mfa-container">
          <h2>Two-Factor Authentication</h2>
          <MFAVerification
            onVerificationSuccess={handleMFASuccess}
          />
        </div>
      );
    }

    // Si hay una verificación de email pendiente
    if (signupState.pendingVerification) {
      return (
        <EmailVerificationStatus
          email={signupState.verificationEmail || ''}
          onBackToLogin={handleBackToLogin}
        />
      );
    }

    // Si está en proceso de registro
    if (signupState.isSigningUp) {
      return (
        <div className="signup-container">
          <h2>Create Account</h2>
          <SignupForm onSignupSuccess={handleSignupSuccess} />
          <p className="auth-switch">
            Already have an account?{' '}
            <button onClick={handleBackToLogin} className="link-button">
              Log in
            </button>
          </p>
        </div>
      );
    }

    // Formulario de login por defecto
    return (
      <div className="login-container">
        <h2>Login</h2>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        <p className="auth-switch">
          Don't have an account?{' '}
          <button onClick={handleSignupClick} className="link-button">
            Sign up
          </button>
        </p>
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
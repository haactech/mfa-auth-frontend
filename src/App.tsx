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
    const pathSegments = window.location.pathname.split('/');
    const verifyEmailIndex = pathSegments.indexOf('verify-email');
    
    if (verifyEmailIndex !== -1 && pathSegments[verifyEmailIndex + 1]) {
      setVerificationToken(pathSegments[verifyEmailIndex + 1]);
      window.history.replaceState({}, document.title, '/');
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
          <h2>¡Bienveido a creze auth, {authState.user?.username}!</h2>
          {!authState.user?.is_mfa_enabled && !authState.showMFASetup && (
            <div className="mfa-setup-prompt">
              <p>Tu cuenta no tiene doble factor activado.</p>
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
          <h2>Crear una cuenta</h2>
          <SignupForm onSignupSuccess={handleSignupSuccess} />
          <p className="auth-switch">
            ¿Ya tienes una cuenta?{' '}
            <button onClick={handleBackToLogin} className="link-button">
              Iniciar sesión
            </button>
          </p>
        </div>
      );
    }

    return (
      <div className="login-container">
        <h2>Inicio de sesión</h2>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        <p className="auth-switch">
          ¿No tienes una cuenta?{' '}
          <button onClick={handleSignupClick} className="link-button">
             Registrate
          </button>
        </p>
      </div>
    );
  };

  return (
    <div className="app">
      <main className="app-main">
        {renderAuthContent()}
      </main>
    </div>
  );
}

export default App;
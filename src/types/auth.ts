
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    requires_mfa: boolean;
    session_id?: string;
    user: User;
    tokens?: {
      access: string;
      refresh: string;
    };
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    is_mfa_enabled: boolean;
  }
  
  export interface MFAVerificationRequest {
    token: string;
    session_id: string;
    device_info?: {
      ip?: string;
      user_agent?: string;
    };
  }

export interface MFASetupResponse {
    qr_code: string;
    manual_entry_key: string;
    message: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    requiresMFA: boolean;
    showMFASetup: boolean;
    sessionId?: string;
    user?: AuthResponse['user'];
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface SignupResponse {
  message: string;
  username: string;
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
}
export interface MFAVerificationResponse {
  is_verified: boolean;
  backup_codes?: string[];
  message: string;
  warning?: string;
}
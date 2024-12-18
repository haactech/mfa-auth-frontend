// src/types/auth.ts

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: number;
        username: string;
        email: string;
        is_mfa_enabled: boolean;
    };
    requires_mfa: boolean;
    tokens?: {
        access: string;
        refresh: string;
    }
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
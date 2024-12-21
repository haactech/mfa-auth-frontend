import { AuthResponse, LoginCredentials, MFAVerificationRequest, MFASetupResponse, SignupCredentials, SignupResponse, EmailVerificationResponse, MFAVerificationResponse } from "../types/auth";
import config from "../config";

const API_URL = config.API_URL;

const getCsrfToken = (): string | null => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

const fetchCsrfToken = async () => {
    await fetch(`${API_URL}/auth/csrf/`, {
        method: 'GET',
        credentials: 'include',
    });
};

const getHeaders = (includeAuth = false) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken() || '',
    };

    if (includeAuth) {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

const saveTokens = (tokens: { access: string; refresh: string }) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
};

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        await fetchCsrfToken();
        
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(credentials),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await response.json();
        
        if (!data.requires_mfa && data.tokens) {
            saveTokens(data.tokens);
        } else if (data.session_id) {
            localStorage.setItem('mfa_session_id', data.session_id);
        }

        return data;
    },

    async verifyMFA(token: string): Promise<AuthResponse> {
        const sessionId = localStorage.getItem('mfa_session_id');
        if (!sessionId) {
            throw new Error('No MFA session found');
        }

        const verificationData: MFAVerificationRequest = {
            token,
            session_id: sessionId,
            device_info: {
                user_agent: navigator.userAgent
            }
        };

        const response = await fetch(`${API_URL}/auth/verify-mfa/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(verificationData),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "MFA verification failed");
        }

        const data = await response.json();
        
        if (data.tokens) {
            saveTokens(data.tokens);
            localStorage.removeItem('mfa_session_id');
        }

        return data;
    },

    async setupMFA(): Promise<MFASetupResponse> {
        const response = await fetch(`${API_URL}/auth/setup-mfa/`, {
            method: "GET",
            headers: getHeaders(true),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("MFA setup failed");
        }

        return response.json();
    },

    async verifyMFASetup(verificationCode: string): Promise<MFAVerificationResponse> {
        const response = await fetch(`${API_URL}/auth/setup-mfa/`, {
            method: "POST",
            headers: getHeaders(true), 
            body: JSON.stringify({ verification_code: verificationCode }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "MFA setup verification failed");
        }

        return response.json();
    },

    async signup(credentials:SignupCredentials):Promise<SignupResponse> {
        await fetchCsrfToken();

        const signupResponse = await fetch(`${API_URL}/auth/signup/`,{
            method:"POST",
            headers: getHeaders(),
            body: JSON.stringify(credentials),
            credentials: "include"
        })

        if(!signupResponse.ok) {
            const errorData = await signupResponse.json()
            throw new Error(errorData.error || "Registration failed");
        }

        return signupResponse.json();
    },

    async verifyEmail(token:string):Promise<EmailVerificationResponse> {
        const verificationResponse = await fetch(`${API_URL}/auth/verify-email/${token}/`,{
            method: 'GET',
            credentials:'include'
        })

        if(!verificationResponse.ok) {
            const errorData = await verificationResponse.json();
            throw new Error(errorData.error || "Email verification failed")
        }

        return verificationResponse.json()
    },

    getToken(): string | null {
        return localStorage.getItem('access_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    async logout(): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/auth/logout/`, {
                method: 'POST',
                headers: getHeaders(true),
                credentials: 'include'
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Limpiar storage incluso si la petición falla
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('mfa_session_id');
        }
    }
};
import { AuthResponse, LoginCredentials, MFASetupResponse } from "../types/auth";

const API_URL = "http://localhost:8000/api";

const saveTokens = (tokens: { access: string; refresh: string }) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  };

export const authService = {
    async login(credentials:LoginCredentials): Promise<AuthResponse> {
        const authenticationResponse = await fetch(`${API_URL}/auth/login/`, {
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)            
        });
    
        if(!authenticationResponse.ok) {
            throw new Error('login failed')
        }

        const authData = await authenticationResponse.json()

        if(authData.tokens && !authData.requires_mfa) {
            saveTokens(authData.tokens)
        }

        return authData
    },

    async verifyMFA(token: string, sessionId: string): Promise<AuthResponse> {
        const verificationResponse = await fetch(`${API_URL}/auth/verify-mfa/`,{
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token, session_id: sessionId})
        })

        if (!verificationResponse.ok) {
            throw new Error("MFA verification failed")
        }

        const verificationData = await verificationResponse.json();

        if (verificationData.tokens) {
            saveTokens(verificationData.tokens)
        }

        return verificationData
    },

    async setupMFA(): Promise<MFASetupResponse> {
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
            throw new Error("No access token found");
        }

        const response = await fetch(`${API_URL}/auth/setup-mfa/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error("MFA setup failed");
        }

        return response.json();
    },

    getToken(): string | null {
        return localStorage.getItem('access_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};
import { AuthResponse, LoginCredentials, MFASetupResponse } from "../types/auth";

const API_URL = "http://localhost:8000/api";

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
        // Primero obtenemos el token CSRF
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
        
        if (data.tokens && !data.requires_mfa) {
            saveTokens(data.tokens);
        }

        return data;
    },

    async verifyMFA(token: string): Promise<AuthResponse> {
        const sessionId = this.getToken()

        const response = await fetch(`${API_URL}/auth/verify-mfa/`, {
            method: "POST",
            headers: {
                ...getHeaders(),
                'Authorization': `Bearer ${sessionId}`
            },
            body: JSON.stringify({
                token,
                request_meta: {
                    REMOTE_ADDR: window.location.hostname,
                    HTTP_USER_AGENT: navigator.userAgent
                }
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "MFA verification failed");
        }

        const data = await response.json();
        
        if (data.tokens) {
            saveTokens(data.tokens);
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
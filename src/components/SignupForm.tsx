import  { useState } from 'react'
import { authService } from '../services/authService'
import type { SignupCredentials } from '../types/auth'

interface SignupFormProps {
    onSignupSuccess: (email: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
    const [ credentials, setCredentials ] = useState<SignupCredentials>({
        username:"",
        email: "",
        password:"",
        password_confirm:""
    })
    const [ error, setError ] = useState<string>('')
    const [ isLoading, setIsLoading ] = useState(false)

    const handleSubmit = async(event:React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const signupServiceResponse = await authService.signup(credentials)
            onSignupSuccess(signupServiceResponse.email)
        } catch (error) {
          console.log("error", error)
            setError(error instanceof Error ? error.message : 'Registration failed');
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            value={credentials.username}
            onChange={(e) => setCredentials({
              ...credentials,
              username: e.target.value
            })}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={credentials.email}
            onChange={(e) => setCredentials({
              ...credentials,
              email: e.target.value
            })}
            required
            disabled={isLoading}
          />
        </div>
  
        <div className="form-group">
          <label htmlFor="password">Contraseña </label>
          <input
            type="password"
            id="password"
            value={credentials.password}
            onChange={(e) => setCredentials({
              ...credentials,
              password: e.target.value
            })}
            required
            disabled={isLoading}
          />
          <small className="form-help">
          La contraseña debe contener al menos 8 caracteres, incluyendo letras, números y caracteres especiales.
          </small>
        </div>
  
        <div className="form-group">
          <label htmlFor="password_confirm">Confirmar Password</label>
          <input
            type="password"
            id="password_confirm"
            value={credentials.password_confirm}
            onChange={(e) => setCredentials({
              ...credentials,
              password_confirm: e.target.value
            })}
            required
            disabled={isLoading}
          />
        </div>
  
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Creando tu cuenta...' : 'Registrarme'}
        </button>
      </form>
  
    )
}
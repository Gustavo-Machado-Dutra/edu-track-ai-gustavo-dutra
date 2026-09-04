import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { login, register } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = isRegistering
        ? await register({ name, email, password })
        : await login({ email, password });

      if (response.error) {
        setError(response.error.message || (isRegistering ? 'Erro ao criar conta' : 'Erro ao fazer login'));
      } else {
        onLoginSuccess();
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((current) => !current);
    setError('');
  };

  return (
    <main className="login-page">
      <Card className="login-card" padding="lg">
        <h1>EduTrack AI</h1>
        <p className="login-subtitle">{isRegistering ? 'Comece sua organização acadêmica' : 'Mission control acadêmico'}</p>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <Input
              type="text"
              label="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
              required
              disabled={isLoading}
            />
          )}

          <Input
            type="email"
            label="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            label="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            minLength={8}
            required
            disabled={isLoading}
            error={error}
          />

          <Button type="submit" isLoading={isLoading} className="login-button">
            {isRegistering ? 'Criar conta' : 'Entrar'}
          </Button>
        </form>

        <button type="button" className="login-toggle" onClick={toggleMode} disabled={isLoading}>
          {isRegistering ? 'Já tenho uma conta' : 'Ainda não tenho uma conta'}
        </button>
      </Card>
    </main>
  );
}

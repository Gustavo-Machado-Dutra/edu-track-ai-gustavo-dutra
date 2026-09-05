import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { login, register } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type AuthScreen = 'welcome' | 'login' | 'register';

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [screen, setScreen] = useState<AuthScreen>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRegistering = screen === 'register';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (isRegistering && name.trim().length < 2) {
      setError('Informe seu nome para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const response = isRegistering
        ? await register({ name, email, password })
        : await login({ email, password });

      if (response.error) {
        setError(response.error.message || (isRegistering ? 'Não foi possível criar a conta.' : 'Não foi possível entrar agora. Tente novamente.'));
      } else {
        onLoginSuccess();
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const changeScreen = (nextScreen: AuthScreen) => {
    setScreen(nextScreen);
    setError('');
    setShowPassword(false);
  };

  if (screen === 'welcome') {
    return (
      <main className="auth-page auth-page-welcome">
        <div className="auth-background-grid" aria-hidden="true" />
        <div className="auth-orb auth-orb-primary" aria-hidden="true" />
        <div className="auth-orb auth-orb-secondary" aria-hidden="true" />

        <section className="welcome-layout" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <div className="auth-brand auth-brand-large">
              <span className="auth-brand-mark" aria-hidden="true">✦</span>
              <span>
                <strong>EduTrack AI</strong>
                <small>MISSION CONTROL</small>
              </span>
            </div>

            <p className="auth-kicker">SEU CENTRO DE COMANDO ACADÊMICO</p>
            <h1 id="welcome-title">Transforme seus estudos em uma missão.</h1>
            <p className="welcome-description">
              Organize tarefas, acompanhe seu progresso e estude com mais clareza usando inteligência que trabalha a seu favor.
            </p>

            <div className="welcome-actions">
              <Button type="button" size="lg" onClick={() => changeScreen('register')}>
                Criar minha conta <span aria-hidden="true">→</span>
              </Button>
              <button type="button" className="auth-secondary-action" onClick={() => changeScreen('login')}>
                Já tenho uma conta <span aria-hidden="true">↗</span>
              </button>
            </div>

            <div className="welcome-trust">
              <span className="trust-avatars" aria-hidden="true"><i>ET</i><i>+</i><i>AI</i></span>
              <span>Feito para quem leva o futuro a sério.</span>
            </div>
          </div>

          <div className="welcome-visual" aria-hidden="true">
            <div className="visual-radar">
              <div className="radar-ring radar-ring-one" />
              <div className="radar-ring radar-ring-two" />
              <div className="radar-ring radar-ring-three" />
              <div className="radar-sweep" />
              <div className="radar-core"><span>✦</span></div>
              <span className="radar-point radar-point-one" />
              <span className="radar-point radar-point-two" />
              <span className="radar-point radar-point-three" />
            </div>
            <div className="visual-label visual-label-top">FOCO // 100%</div>
            <div className="visual-label visual-label-bottom">SYSTEM ONLINE</div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page auth-page-form">
      <div className="auth-background-grid" aria-hidden="true" />
      <div className="auth-form-shell">
        <div className="auth-form-header">
          <button className="auth-brand auth-brand-button" type="button" onClick={() => changeScreen('welcome')} aria-label="Voltar para a página inicial">
            <span className="auth-brand-mark" aria-hidden="true">✦</span>
            <span>
              <strong>EduTrack AI</strong>
              <small>MISSION CONTROL</small>
            </span>
          </button>
          <span className="auth-status"><i /> SISTEMA ONLINE</span>
        </div>

        <section className="auth-form-card" aria-labelledby="auth-form-title">
          <button type="button" className="auth-back-link" onClick={() => changeScreen('welcome')} disabled={isLoading}>
            <span aria-hidden="true">←</span> Voltar
          </button>

          <div className="auth-heading">
            <p className="auth-kicker">{isRegistering ? 'NOVA OPERAÇÃO' : 'ACESSO RESTRITO'}</p>
            <h1 id="auth-form-title">{isRegistering ? 'Crie seu centro de comando.' : 'Bem-vindo de volta.'}</h1>
            <p>{isRegistering ? 'Configure sua jornada acadêmica em poucos passos.' : 'Entre para continuar sua missão acadêmica.'}</p>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Tipo de acesso">
            <button type="button" role="tab" aria-selected={!isRegistering} className={!isRegistering ? 'active' : ''} onClick={() => changeScreen('login')} disabled={isLoading}>Entrar</button>
            <button type="button" role="tab" aria-selected={isRegistering} className={isRegistering ? 'active' : ''} onClick={() => changeScreen('register')} disabled={isLoading}>Criar conta</button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegistering && (
              <Input
                type="text"
                name="name"
                label="Nome completo"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como podemos chamar você?"
                autoComplete="name"
                required
                disabled={isLoading}
              />
            )}

            <Input
              type="email"
              name="email"
              label="E-mail acadêmico"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              disabled={isLoading}
            />

            <div className="password-field">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 8 caracteres"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                minLength={8}
                required
                disabled={isLoading}
                error={error}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} disabled={isLoading} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? '◉' : '◌'}
              </button>
            </div>

            {!isRegistering && (
              <div className="auth-form-options">
                <label className="checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoading} />
                  <span aria-hidden="true" />
                  Lembrar de mim
                </label>
                <button type="button" className="forgot-password" onClick={() => setError('A recuperação de senha estará disponível em breve.')} disabled={isLoading}>
                  Esqueci minha senha
                </button>
              </div>
            )}

            <Button type="submit" isLoading={isLoading} size="lg" className="login-button">
              {isRegistering ? 'Iniciar minha jornada' : 'Entrar no sistema'} <span aria-hidden="true">→</span>
            </Button>
          </form>

          <p className="auth-legal">Ao continuar, você concorda com nossos <button type="button">Termos de uso</button> e <button type="button">Política de privacidade</button>.</p>
        </section>

        <footer className="auth-form-footer">
          <span>© 2026 EduTrack AI</span>
          <span className="footer-divider" aria-hidden="true" />
          <span>SEGURO. PRIVADO. SEU.</span>
        </footer>
      </div>
    </main>
  );
}

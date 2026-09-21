import { useState } from 'react';
import { login, register } from '../services/api';

interface LoginPageProps { onLoginSuccess: () => void }

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isRegistering = mode === 'register';

  const changeMode = (next: 'login' | 'register') => { setMode(next); setError(''); };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (isRegistering && name.trim().length < 2) { setError('Informe seu nome para continuar.'); return; }
    setIsLoading(true);
    try {
      const response = isRegistering
        ? await register({ name: name.trim(), email: email.trim(), password })
        : await login({ email: email.trim(), password });
      if (response.error) setError(response.error.message);
      else onLoginSuccess();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível conectar à API.');
    } finally {
      setIsLoading(false);
    }
  };

  return <main className="v2-auth">
    <aside className="v2-auth-story">
      <div className="v2-auth-brand"><span aria-hidden="true">✦</span> EduTrack <em>AI</em></div>
      <div><span className="v2-auth-eyebrow">SEU ESPAÇO PARA IR ALÉM</span><h2>Pequenos passos.<br />Grandes<br /><strong>possibilidades.</strong></h2><p>Organize seus estudos, encontre seu ritmo e abra espaço para o que vem pela frente.</p></div>
      <small>Seu tempo. Seu ritmo. Seu futuro. ✦</small>
    </aside>
    <section className="v2-auth-main" aria-labelledby="v2-auth-title">
      <div className="v2-auth-card">
        <span className="v2-auth-eyebrow">BEM-VINDO AO EDUTRACK AI</span>
        <h1 id="v2-auth-title">{isRegistering ? 'Seu espaço começa aqui.' : 'Que bom ter você de volta.'}</h1>
        <p>{isRegistering ? 'Crie sua conta para começar a organizar seus estudos.' : 'Entre para continuar de onde parou.'}</p>
        <div className="v2-auth-switch" role="tablist" aria-label="Acesso">
          <button type="button" role="tab" aria-selected={!isRegistering} className={!isRegistering ? 'active' : ''} onClick={() => changeMode('login')} disabled={isLoading}>Entrar</button>
          <button type="button" role="tab" aria-selected={isRegistering} className={isRegistering ? 'active' : ''} onClick={() => changeMode('register')} disabled={isLoading}>Criar conta</button>
        </div>
        <form onSubmit={handleSubmit} className="v2-auth-form">
          {isRegistering && <label>Seu nome<input name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} required placeholder="Como podemos chamar você?" disabled={isLoading} /></label>}
          <label>E-mail<input name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="voce@exemplo.com" disabled={isLoading} /></label>
          <label>Senha<span className="v2-auth-password"><input name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength={8} required placeholder="Pelo menos 8 caracteres" disabled={isLoading} /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} disabled={isLoading}>{showPassword ? '◉' : '◎'}</button></span></label>
          {error && <p className="v2-auth-error" role="alert">{error}</p>}
          <button type="submit" className="v2-auth-submit" disabled={isLoading}>{isLoading ? 'Aguarde...' : isRegistering ? 'Criar conta →' : 'Entrar →'}</button>
        </form>
        <p className="v2-auth-footnote">{isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button type="button" onClick={() => changeMode(isRegistering ? 'login' : 'register')}>{isRegistering ? 'Entrar' : 'Criar conta'}</button></p>
      </div>
    </section>
  </main>;
}

import { Card } from '../components/Card';
import { useUserSettings } from '../hooks/useUserSettings';
import { clearSession } from '../services/api';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function SettingsPage() {
  const { user, isLoading, isSaving, error, updateNotifications } = useUserSettings();

  if (isLoading) {
    return (
      <main className="app-shell">
        <p className="loading-text">Carregando configurações...</p>
      </main>
    );
  }

  return (
    <main className="app-shell settings-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Conta</p>
          <h1>Configurações</h1>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      {user && (
        <div className="settings-layout">
          <div className="settings-main-column">
            <Card className="profile-card" padding="lg">
              <div className="profile-summary">
                <div className="profile-avatar" aria-hidden="true">{getInitials(user.name)}</div>
                <div>
                  <p className="eyebrow">Perfil ativo</p>
                  <h2>{user.name}</h2>
                  <p>Seu centro de comando acadêmico.</p>
                </div>
              </div>
              <div className="profile-details">
                <div><span>E-mail</span><strong>{user.email}</strong></div>
                <div><span>Fuso horário</span><strong>{user.timezone}</strong></div>
              </div>
              <div className="profile-actions">
                <button type="button" className="settings-link">Editar perfil <span aria-hidden="true">→</span></button>
                <button type="button" className="settings-link settings-link-danger" onClick={() => { clearSession(); window.location.reload(); }}>Encerrar sessão <span aria-hidden="true">↪</span></button>
              </div>
            </Card>

            <Card className="preferences-card" padding="md">
              <div>
                <p className="eyebrow">Experiência</p>
                <h2>Preferências</h2>
              </div>
              <div className="preference-row">
                <span className="preference-icon" aria-hidden="true">♧</span>
                <div>
                  <strong>Notificações de prazo</strong>
                  <p>Receba alertas quando uma entrega estiver próxima.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={user.notificationsEnabled}
                    disabled={isSaving}
                    onChange={(event) => updateNotifications(event.target.checked)}
                    aria-label="Ativar notificações de prazo"
                  />
                  <span aria-hidden="true" />
                </label>
              </div>
            </Card>
          </div>

          <div className="settings-side-column">
            <Card className="security-card" padding="md">
              <span className="settings-card-icon" aria-hidden="true">⌁</span>
              <h2>Segurança</h2>
              <p>Seu acesso é protegido por autenticação JWT e sessão renovável.</p>
              <button type="button" className="settings-link">Gerenciar acesso <span aria-hidden="true">→</span></button>
            </Card>
            <Card className="support-card" padding="md">
              <span className="settings-card-icon settings-card-icon-blue" aria-hidden="true">?</span>
              <h2>Precisa de ajuda?</h2>
              <p>Consulte orientações para aproveitar melhor seu centro de comando.</p>
              <button type="button" className="settings-link">Central de suporte <span aria-hidden="true">↗</span></button>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}

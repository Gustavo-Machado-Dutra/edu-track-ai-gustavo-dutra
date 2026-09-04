import { Card } from '../components/Card';
import { useUserSettings } from '../hooks/useUserSettings';

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
        <Card className="settings-card">
          <div>
            <h2>Notificações</h2>
            <p>Receba alertas de tarefas com prazo próximo.</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={user.notificationsEnabled}
              disabled={isSaving}
              onChange={(event) => updateNotifications(event.target.checked)}
            />
            <span>{user.notificationsEnabled ? 'Ativadas' : 'Desativadas'}</span>
          </label>
        </Card>
      )}
    </main>
  );
}

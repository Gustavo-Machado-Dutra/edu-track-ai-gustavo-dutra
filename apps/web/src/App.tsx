import { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { StudySessionsPage } from './pages/StudySessionsPage';
import { TasksPage } from './pages/TasksPage';
import { AUTH_SESSION_EXPIRED_EVENT, clearSession, getAccessToken } from './services/api';

type Page = 'dashboard' | 'tasks' | 'subjects' | 'sessions' | 'settings';

const navigationItems: Array<{ page: Page; label: string; icon: string }> = [
  { page: 'dashboard', label: 'Dashboard', icon: '▦' },
  { page: 'subjects', label: 'Disciplinas', icon: '▤' },
  { page: 'tasks', label: 'Tarefas', icon: '▣' },
  { page: 'sessions', label: 'Sessões', icon: '◷' },
];

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const [page, setPage] = useState<Page>('dashboard');

  useEffect(() => {
    const handleSessionExpired = () => setIsAuthenticated(false);

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  if (!isAuthenticated) return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;

  const pageContent = {
    dashboard: <DashboardPage />,
    tasks: <TasksPage />,
    subjects: <SubjectsPage />,
    sessions: <StudySessionsPage />,
    settings: <SettingsPage />,
  }[page];

  return (
    <div className="app-layout">
      <aside className="app-sidebar" aria-label="Navegação principal">
        <button className="app-brand" type="button" onClick={() => setPage('dashboard')}>
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span><strong>EduTrack AI</strong><small>MISSION CONTROL</small></span>
        </button>
        <button className="sidebar-create" type="button" onClick={() => setPage('tasks')}><span aria-hidden="true">＋</span> Criar tarefa</button>
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button key={item.page} className={page === item.page ? 'active' : ''} type="button" onClick={() => setPage(item.page)}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className={page === 'settings' ? 'active' : ''} type="button" onClick={() => setPage('settings')}><span className="nav-icon" aria-hidden="true">⚙</span>Configurações</button>
          <button className="sidebar-signout" type="button" onClick={() => { clearSession(); setIsAuthenticated(false); }}><span className="nav-icon" aria-hidden="true">↪</span>Sair</button>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar">
          <div className="topbar-search" role="search" aria-label="Busca"><span aria-hidden="true">⌕</span><span>Buscar disciplinas e tarefas...</span></div>
          <div className="topbar-actions"><button type="button" className="icon-button" aria-label="Notificações">♧<i /></button><button type="button" className="icon-button" aria-label="Atalhos">ϟ</button><div className="user-avatar" aria-label="Perfil do usuário">ET</div></div>
        </header>
        {pageContent}
      </div>
    </div>
  );
}

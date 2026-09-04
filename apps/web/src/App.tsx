import { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { StudySessionsPage } from './pages/StudySessionsPage';
import { TasksPage } from './pages/TasksPage';
import { clearSession, getAccessToken } from './services/api';

type Page = 'dashboard' | 'tasks' | 'subjects' | 'sessions' | 'settings';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const [page, setPage] = useState<Page>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const pageContent = {
    dashboard: <DashboardPage />,
    tasks: <TasksPage />,
    subjects: <SubjectsPage />,
    sessions: <StudySessionsPage />,
    settings: <SettingsPage />,
  }[page];

  return (
    <>
      <nav className="app-nav" aria-label="NavegaÃ§Ã£o principal">
        <div className="app-nav-brand">EduTrack AI</div>
        <div className="app-nav-links">
          <button className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>
            Dashboard
          </button>
          <button className={page === 'tasks' ? 'active' : ''} onClick={() => setPage('tasks')}>
            Tarefas
          </button>
          <button className={page === 'subjects' ? 'active' : ''} onClick={() => setPage('subjects')}>
            Disciplinas
          </button>
          <button className={page === 'sessions' ? 'active' : ''} onClick={() => setPage('sessions')}>
            Sessões
          </button>
          <button className={page === 'settings' ? 'active' : ''} onClick={() => setPage('settings')}>
            Configurações
          </button>
        </div>
        <button
          className="app-nav-logout"
          onClick={() => {
            clearSession();
            setIsAuthenticated(false);
          }}
        >
          Sair
        </button>
      </nav>
      {pageContent}
    </>
  );
}


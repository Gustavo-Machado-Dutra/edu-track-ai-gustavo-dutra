import { useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import type { Page } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { StudySessionsPage } from './pages/StudySessionsPage';
import { TasksPage } from './pages/TasksPage';
import { AUTH_SESSION_EXPIRED_EVENT, clearSession, getAccessToken, getStoredUser } from './services/api';
import { useTasks } from './hooks/useTasks';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const [page, setPage] = useState<Page>('dashboard');
  const [openMenu, setOpenMenu] = useState<'notifications' | 'shortcuts' | 'profile' | null>(null);
  const [storedUser, setStoredUser] = useState(() => getStoredUser<{ name?: string; email?: string }>());
  const userInitials = storedUser?.name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'ET';
  const { tasks } = useTasks();
  const pendingTasks = tasks.filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS');
  const urgentTasks = pendingTasks.filter((task) => task.priority === 'URGENT' || task.priority === 'HIGH');
  const notifications = urgentTasks.length > 0
    ? urgentTasks.slice(0, 3).map((task) => ({ title: task.title, detail: `${task.subject.name} · ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'sem prazo'}` }))
    : [{ title: 'Tudo sob controle', detail: 'Nenhuma entrega crítica no momento' }];

  useEffect(() => {
    const handleSessionExpired = () => {
      setStoredUser(null);
      setIsAuthenticated(false);
    };
    const handleDocumentClick = () => setOpenMenu(null);

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    document.addEventListener('click', handleDocumentClick);
    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  if (!isAuthenticated) return <LoginPage onLoginSuccess={() => { setStoredUser(getStoredUser<{ name?: string; email?: string }>()); setIsAuthenticated(true); }} />;

  const toggleMenu = (menu: 'notifications' | 'shortcuts' | 'profile') => (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenu((current) => current === menu ? null : menu);
  };

  const navigateFromMenu = (nextPage: Page) => {
    setPage(nextPage);
    setOpenMenu(null);
  };

  const pageContent = {
    dashboard: <DashboardPage />,
    tasks: <TasksPage />,
    subjects: <SubjectsPage />,
    sessions: <StudySessionsPage />,
    ai: <AIAssistantPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage />,
  }[page];

  return (
    <AppLayout currentPage={page} onNavigate={setPage} onCreateTask={() => setPage('tasks')}>
      <div className="app-content">
        <header className="topbar">
          <div className="topbar-search" role="search" aria-label="Busca"><span aria-hidden="true">⌕</span><span>Buscar disciplinas e tarefas...</span></div>
          <div className="topbar-actions">
            <div className="topbar-menu-wrap">
            <button type="button" className={`icon-button ${openMenu === 'notifications' ? 'active' : ''}`} aria-label="Notificações" aria-expanded={openMenu === 'notifications'} onClick={toggleMenu('notifications')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
              <span className="notification-dot" aria-hidden="true" />
            </button>
            {openMenu === 'notifications' && (
              <div className="topbar-popover notifications-popover" role="status" onClick={(event) => event.stopPropagation()}>
                <div className="popover-heading"><div><span className="eyebrow">Central de alertas</span><h2>Notificações</h2></div><span className="popover-count">{urgentTasks.length}</span></div>
                <div className="notification-list">
                  {notifications.map((notification) => <div className="notification-item" key={notification.title}><span className="notification-item-dot" aria-hidden="true" /><p><strong>{notification.title}</strong><small>{notification.detail}</small></p></div>)}
                </div>
                <button type="button" className="popover-link" onClick={() => navigateFromMenu('tasks')}>Ver todas as tarefas <span aria-hidden="true">→</span></button>
              </div>
            )}
            </div>
            <div className="topbar-menu-wrap">
            <button type="button" className={`icon-button ${openMenu === 'shortcuts' ? 'active' : ''}`} aria-label="Atalhos de navegação" aria-expanded={openMenu === 'shortcuts'} onClick={toggleMenu('shortcuts')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M7 9h.01M11 9h.01M15 9h.01M19 9h.01M7 13h.01M11 13h.01M15 13h4M7 16h10" />
              </svg>
            </button>
            {openMenu === 'shortcuts' && (
              <div className="topbar-popover shortcuts-popover" role="menu" onClick={(event) => event.stopPropagation()}>
                <div className="popover-heading"><div><span className="eyebrow">Acesso rápido</span><h2>Atalhos</h2></div></div>
                <button type="button" role="menuitem" onClick={() => navigateFromMenu('dashboard')}><span>⌘ D</span> Dashboard <small>Visão geral</small></button>
                <button type="button" role="menuitem" onClick={() => navigateFromMenu('tasks')}><span>⌘ T</span> Nova tarefa <small>Organizar próximo passo</small></button>
                <button type="button" role="menuitem" onClick={() => navigateFromMenu('sessions')}><span>⌘ F</span> Foco <small>Iniciar uma sessão</small></button>
                <button type="button" role="menuitem" onClick={() => navigateFromMenu('ai')}><span>⌘ A</span> Copiloto IA <small>Conversar com a IA</small></button>
                <button type="button" role="menuitem" onClick={() => navigateFromMenu('reports')}><span>⌘ R</span> Relatórios <small>Ver desempenho semanal</small></button>
              </div>
            )}
            </div>
            <div className="topbar-menu-wrap">
            <button type="button" className={`user-avatar user-avatar-button ${openMenu === 'profile' ? 'active' : ''}`} aria-label={`Abrir perfil de ${storedUser?.name || 'usuário'}`} aria-expanded={openMenu === 'profile'} onClick={toggleMenu('profile')}>{userInitials}</button>
            {openMenu === 'profile' && (
              <div className="topbar-popover profile-popover" role="menu" onClick={(event) => event.stopPropagation()}>
                <div className="profile-popover-summary"><span className="profile-popover-avatar">{userInitials}</span><div><strong>{storedUser?.name || 'Estudante'}</strong><small>{storedUser?.email || 'Perfil acadêmico'}</small></div></div>
                <button type="button" role="menuitem" onClick={() => navigateFromMenu('settings')}><span aria-hidden="true">⚙</span> Configurações</button>
                <button type="button" className="profile-signout" role="menuitem" onClick={() => { clearSession(); setOpenMenu(null); setIsAuthenticated(false); }}><span aria-hidden="true">↪</span> Sair da conta</button>
              </div>
            )}
            </div>
          </div>
        </header>
        {pageContent}
      </div>
    </AppLayout>
  );
}

import { clearSession } from '../services/api';

export type Page = 'dashboard' | 'tasks' | 'subjects' | 'sessions' | 'ai' | 'reports' | 'settings';

type SidebarProps = { currentPage: Page; onNavigate: (page: Page) => void; onCreateTask: () => void };

export function Sidebar({ currentPage, onNavigate, onCreateTask }: SidebarProps) {
  const handleSignOut = () => { clearSession(); window.location.reload(); };
  const items: Array<{ page: Page; label: string; icon: string }> = [
    { page: 'dashboard', label: 'Dashboard', icon: '▦' },
    { page: 'subjects', label: 'Disciplinas', icon: '▤' },
    { page: 'tasks', label: 'Tarefas', icon: '▣' },
    { page: 'sessions', label: 'Sessões', icon: '◷' },
    { page: 'ai', label: 'Copiloto IA', icon: '✦' },
    { page: 'reports', label: 'Relatórios', icon: '▥' },
  ];
  return (
    <aside className="app-sidebar" aria-label="Navegação principal">
      <button className="app-brand" type="button" onClick={() => onNavigate('dashboard')}>
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span><strong>EduTrack AI</strong><small>MISSION CONTROL</small></span>
      </button>
      <button className="sidebar-create" type="button" onClick={onCreateTask}><span aria-hidden="true">＋</span> Criar tarefa</button>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button key={item.page} className={currentPage === item.page ? 'active' : ''} type="button" aria-current={currentPage === item.page ? 'page' : undefined} onClick={() => onNavigate(item.page)}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className={currentPage === 'settings' ? 'active' : ''} type="button" onClick={() => onNavigate('settings')}><span className="nav-icon" aria-hidden="true">⚙</span>Configurações</button>
        <button className="sidebar-signout" type="button" onClick={handleSignOut}><span className="nav-icon" aria-hidden="true">↪</span>Sair</button>
      </div>
    </aside>
  );
}

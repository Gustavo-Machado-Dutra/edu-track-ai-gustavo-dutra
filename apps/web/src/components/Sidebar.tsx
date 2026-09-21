import { clearSession } from '../services/api';

export type Page = 'dashboard' | 'subjects' | 'tasks' | 'calendar' | 'sessions' | 'progress' | 'ai' | 'reports' | 'settings';

type SidebarProps = { currentPage: Page; onNavigate: (page: Page) => void; onCreateTask: () => void };

const items: Array<{ page: Page; label: string; icon: string }> = [
  { page: 'dashboard', label: 'Visão geral', icon: '▦' },
  { page: 'subjects', label: 'Disciplinas', icon: '▤' },
  { page: 'tasks', label: 'Tarefas', icon: '☑' },
  { page: 'calendar', label: 'Calendário', icon: '▦' },
  { page: 'sessions', label: 'Sessões de estudo', icon: '◷' },
  { page: 'progress', label: 'Meu progresso', icon: '↗' },
  { page: 'ai', label: 'Assistente', icon: '✦' },
  { page: 'reports', label: 'Relatórios', icon: '▥' },
];

export function Sidebar({ currentPage, onNavigate, onCreateTask }: SidebarProps) {
  const handleSignOut = () => { clearSession(); window.location.reload(); };
  return (
    <aside className="app-sidebar" aria-label="Navegação principal">
      <button className="app-brand" type="button" onClick={() => onNavigate('dashboard')}>
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span><strong>EduTrack <em>AI</em></strong><small>SEU ESPAÇO DE ESTUDOS</small></span>
      </button>
      <p className="sidebar-caption">MENU PRINCIPAL</p>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button key={item.page} className={currentPage === item.page ? 'active' : ''} type="button" aria-current={currentPage === item.page ? 'page' : undefined} onClick={() => onNavigate(item.page)}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
            {item.page === 'ai' && <span className="sidebar-ai-badge">AI</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-motivation"><span aria-hidden="true">✦</span><p>Um pouco hoje.<br /><strong>Um novo amanhã.</strong></p><small>Cada sessão conta.</small></div>
      <button className="sidebar-create" type="button" onClick={onCreateTask}>＋ Nova tarefa</button>
      <div className="sidebar-footer">
        <button className={currentPage === 'settings' ? 'active' : ''} type="button" onClick={() => onNavigate('settings')}><span className="nav-icon" aria-hidden="true">⚙</span>Configurações</button>
        <button className="sidebar-signout" type="button" onClick={handleSignOut}><span className="nav-icon" aria-hidden="true">↪</span>Sair</button>
      </div>
    </aside>
  );
}

import { clearSession } from '../services/api';

export type Page = 'dashboard' | 'tasks' | 'subjects' | 'sessions' | 'settings';

type SidebarProps = { currentPage: Page; onNavigate: (page: Page) => void; onCreateTask: () => void };

export function Sidebar({ currentPage, onNavigate, onCreateTask }: SidebarProps) {
  const handleSignOut = () => { clearSession(); window.location.reload(); };
  const items: Array<{ page: Page; label: string; icon: string }> = [
    { page: 'dashboard', label: 'Dashboard', icon: '▦' },
    { page: 'subjects', label: 'Disciplinas', icon: '▤' },
    { page: 'tasks', label: 'Tarefas', icon: '▣' },
    { page: 'sessions', label: 'Sessões', icon: '◷' },
  ];
  return <aside className=app-sidebar><button type=button onClick={() => onNavigate('dashboard')}>EduTrack AI</button></aside>;
}

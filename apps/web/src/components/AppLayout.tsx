import type { ReactNode } from 'react';
import { Sidebar, type Page } from './Sidebar';

type Props = { children: ReactNode; currentPage: Page; onNavigate: (page: Page) => void; onCreateTask: () => void };

export function AppLayout({ children, currentPage, onNavigate, onCreateTask }: Props) {
  return <div className=app-layout><Sidebar currentPage={currentPage} onNavigate={onNavigate} onCreateTask={onCreateTask} />{children}</div>;
}

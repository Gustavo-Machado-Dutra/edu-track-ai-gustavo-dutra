import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders the destructive action when deletion is available', () => {
    const markup = renderToStaticMarkup(
      <TaskCard
        id="task-1"
        title="Revisar conteúdo"
        description="Revisar os exercícios do capítulo 3."
        subjectName="Matemática"
        priority="MEDIUM"
        status="TODO"
        onDelete={() => undefined}
      />,
    );

    expect(markup).toContain('Excluir');
    expect(markup).toContain('Revisar os exercícios do capítulo 3.');
  });
});

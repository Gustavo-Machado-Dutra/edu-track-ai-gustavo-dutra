import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders metric label and value', () => {
    const markup = renderToStaticMarkup(
      <MetricCard label="Tarefas abertas" value="12" accent="primary" />,
    );

    expect(markup).toContain('Tarefas abertas');
    expect(markup).toContain('12');
  });
});

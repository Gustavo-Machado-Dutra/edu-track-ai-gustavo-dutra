import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AgentChart } from './AgentChart';
import type { ChartSpecification } from '../types/chart-specification';

function createSpec(overrides: Partial<ChartSpecification> = {}): ChartSpecification {
  return {
    type: 'bar',
    title: 'Tempo de estudo',
    description: 'Minutos por dia',
    xAxis: { field: 'day', label: 'Dia' },
    yAxis: { field: 'minutes', label: 'Minutos' },
    series: [{ field: 'minutes', label: 'Estudo' }],
    data: [
      { day: 'Seg', minutes: 30 },
      { day: 'Ter', minutes: 45 },
    ],
    source: { tool: 'get_study_metrics' },
    datasetVersion: 'v1',
    ...overrides,
  };
}

describe('AgentChart', () => {
  it('renders a validated bar specification with axes and series', () => {
    const markup = renderToStaticMarkup(<AgentChart spec={createSpec()} />);

    expect(markup).toContain('Tempo de estudo');
    expect(markup).toContain('Dia');
    expect(markup).toContain('Minutos');
    expect(markup).toContain('Estudo');
    expect(markup).toContain('30');
    expect(markup).toContain('<svg');
  });

  it('renders table columns from declared fields and ignores arbitrary data fields', () => {
    const markup = renderToStaticMarkup(
      <AgentChart
        spec={createSpec({
          type: 'table',
          data: [{ day: 'Seg', minutes: 30, secret: 'nao renderizar' }],
        })}
      />,
    );

    expect(markup).toContain('Seg');
    expect(markup).toContain('30');
    expect(markup).not.toContain('nao renderizar');
    expect(markup).not.toContain('secret');
  });

  it('renders metric and circular specifications using the declared series', () => {
    const metricMarkup = renderToStaticMarkup(
      <AgentChart spec={createSpec({ type: 'kpi', data: [{ day: 'Total', minutes: 120 }] })} />,
    );
    const donutMarkup = renderToStaticMarkup(
      <AgentChart
        spec={createSpec({
          type: 'donut',
          data: [
            { day: 'Leitura', minutes: 20 },
            { day: 'Exercicios', minutes: 40 },
          ],
        })}
      />,
    );

    expect(metricMarkup).toContain('120');
    expect(metricMarkup).toContain('agent-chart-metric');
    expect(donutMarkup).toContain('agent-chart-pie');
    expect(donutMarkup).toContain('Leitura');
    expect(donutMarkup).toContain('Exercicios');
  });

  it('does not create geometry for non-numeric measures', () => {
    const markup = renderToStaticMarkup(
      <AgentChart spec={createSpec({ data: [{ day: 'Seg', minutes: 'trinta' }] })} />,
    );

    expect(markup).toContain('Sem dados suficientes');
    expect(markup).not.toContain('agent-chart-bar');
  });
});

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useReports } from '../hooks/useReports';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const statusLabels = { PENDING: 'Na fila', PROCESSING: 'Processando', COMPLETED: 'Concluído', FAILED: 'Falhou' } as const;

export function ReportsPage() {
  const { reports, isLoading, isGenerating, error, refetch, generateReport } = useReports();

  return (
    <main className="app-shell reports-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Visão de desempenho</p>
          <h1>Relatórios semanais</h1>
          <p className="page-description">Transforme sua semana de estudos em uma visão clara para o próximo ciclo.</p>
        </div>
        <Button onClick={generateReport} isLoading={isGenerating}><span aria-hidden="true">＋</span> Gerar relatório</Button>
      </header>

      {error && <p className="error-message">{error}</p>}

      <Card className="reports-intro-card" padding="lg">
        <div className="reports-intro-icon" aria-hidden="true">▥</div>
        <div><p className="eyebrow">Resumo oficial</p><h2>Seu histórico, em perspectiva.</h2><p>Os relatórios reúnem tarefas, tempo estudado, progresso por disciplina e insights para ajudar você a ajustar o ritmo.</p></div>
      </Card>

      <section className="reports-section" aria-label="Histórico de relatórios">
        <div className="section-heading"><div><p className="eyebrow">Arquivo</p><h2>Relatórios disponíveis</h2></div><Button variant="ghost" size="sm" onClick={() => refetch()}>Atualizar</Button></div>
        {isLoading ? <p className="loading-text">Carregando relatórios...</p> : reports.length === 0 ? <Card className="reports-empty-card" padding="md"><span aria-hidden="true">◌</span><p>Nenhum relatório foi gerado ainda. Solicite o primeiro para acompanhar sua evolução semanal.</p></Card> : <div className="reports-list">{reports.map((report) => <Card key={report.id} variant="outlined" padding="sm"><article className="report-item"><div className="report-icon" aria-hidden="true">✦</div><div className="report-copy"><h3>Semana de {formatDate(report.periodStart)}</h3><p>{formatDate(report.periodStart)} até {formatDate(report.periodEnd)}</p></div><span className={`report-status report-status-${report.status.toLowerCase()}`}>{statusLabels[report.status]}</span><Button variant="ghost" size="sm" disabled={report.status !== 'COMPLETED'}>Abrir</Button></article></Card>)}</div>}
      </section>
    </main>
  );
}
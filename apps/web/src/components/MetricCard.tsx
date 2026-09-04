type MetricCardProps = {
  label: string;
  value: string;
  accent: 'primary' | 'secondary' | 'tertiary';
};

export function MetricCard({ label, value, accent }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card-${accent}`}>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <span className="metric-orbit" aria-hidden="true" />
    </article>
  );
}

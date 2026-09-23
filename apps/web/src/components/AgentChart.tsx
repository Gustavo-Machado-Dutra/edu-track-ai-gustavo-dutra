import type { ReactNode } from 'react';
import type { ChartSpecification } from '../types/chart-specification';

type AgentChartProps = {
  spec: ChartSpecification;
};

type DataRow = Record<string, unknown>;
type CartesianMode = 'line' | 'area' | 'bar' | 'scatter';
type CartesianPoint = {
  index: number;
  label: string;
  value: number;
};
type Column = {
  field: string;
  label: string;
};

const SVG_WIDTH = 640;
const SVG_HEIGHT = 280;
const PLOT = { top: 24, right: 24, bottom: 54, left: 58 };
const COLORS = ['#c6a2ff', '#70d6c1', '#ffb86b', '#f58ca8', '#89b4fa'];

function isDataRow(value: unknown): value is DataRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRows(spec: ChartSpecification): DataRow[] {
  return Array.isArray(spec.data) ? spec.data.filter(isDataRow) : [];
}

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '—';
}

function formatValue(value: unknown): string {
  const numberValue = getNumber(value);
  return numberValue === null ? getText(value) : String(numberValue);
}

function getColor(index: number): string {
  const color = COLORS[index % COLORS.length];
  return typeof color === 'string' ? color : '#c6a2ff';
}

function getRange(values: number[]): { min: number; max: number } {
  const minimum = Math.min(...values, 0);
  const maximum = Math.max(...values, 0);
  if (minimum === maximum) {
    return { min: minimum - 1, max: maximum + 1 };
  }
  return { min: minimum, max: maximum };
}

function scaleValue(value: number, range: { min: number; max: number }, start: number, end: number): number {
  if (range.max === range.min) {
    return (start + end) / 2;
  }
  return start + ((value - range.min) / (range.max - range.min)) * (end - start);
}

function xPosition(index: number, count: number, plotWidth: number): number {
  if (count <= 1) {
    return PLOT.left + plotWidth / 2;
  }
  return PLOT.left + (index / (count - 1)) * plotWidth;
}

function getColumns(spec: ChartSpecification): Column[] {
  const candidates: Column[] = [
    { field: spec.xAxis.field, label: spec.xAxis.label },
    { field: spec.yAxis.field, label: spec.yAxis.label },
    ...spec.series.map((series) => ({ field: series.field, label: series.label })),
  ];
  return candidates.filter((column, index) => candidates.findIndex((item) => item.field === column.field) === index);
}

function ChartEmpty() {
  return <div className="agent-chart-empty" role="status">Sem dados suficientes para renderizar esta visualização.</div>;
}

function CartesianChart({ spec, mode }: { spec: ChartSpecification; mode: CartesianMode }) {
  const rows = getRows(spec);
  const plotWidth = SVG_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = SVG_HEIGHT - PLOT.top - PLOT.bottom;
  const seriesPoints = spec.series.map((series) => ({
    series,
    points: rows
      .map((row, index): CartesianPoint | null => {
        const value = getNumber(row[series.field]);
        return value === null ? null : { index, label: getText(row[spec.xAxis.field]), value };
      })
      .filter((point): point is CartesianPoint => point !== null),
  }));
  const values = seriesPoints.flatMap((entry) => entry.points.map((point) => point.value));

  if (rows.length === 0 || values.length === 0) {
    return <ChartEmpty />;
  }

  const range = getRange(values);
  const baseline = scaleValue(0, range, PLOT.top + plotHeight, PLOT.top);
  const yTicks = Array.from({ length: 5 }, (_, index) => range.min + ((range.max - range.min) * index) / 4);
  const xLabelStep = Math.max(1, Math.ceil(rows.length / 8));
  const groupWidth = plotWidth / Math.max(rows.length, 1);
  const barWidth = Math.max(4, (groupWidth * 0.72) / Math.max(spec.series.length, 1));

  const pathFor = (points: CartesianPoint[]) => points
    .map((point, pointIndex) => {
      const x = xPosition(point.index, rows.length, plotWidth);
      const y = scaleValue(point.value, range, PLOT.top + plotHeight, PLOT.top);
      return (pointIndex === 0 ? 'M' : 'L') + ' ' + x + ' ' + y;
    })
    .join(' ');

  return (
    <div className="agent-chart-visual">
      <svg className="agent-chart-svg" viewBox={'0 0 ' + SVG_WIDTH + ' ' + SVG_HEIGHT} role="img" aria-label={spec.title}>
        <title>{spec.title}</title>
        {spec.description && <desc>{spec.description}</desc>}
        {yTicks.map((tick) => {
          const y = scaleValue(tick, range, PLOT.top + plotHeight, PLOT.top);
          return (
            <g key={'tick-' + tick} className="agent-chart-grid-line">
              <line x1={PLOT.left} x2={SVG_WIDTH - PLOT.right} y1={y} y2={y} />
              <text x={PLOT.left - 10} y={y + 4} textAnchor="end">{formatValue(tick)}</text>
            </g>
          );
        })}
        <line className="agent-chart-axis" x1={PLOT.left} x2={PLOT.left} y1={PLOT.top} y2={PLOT.top + plotHeight} />
        <line className="agent-chart-axis" x1={PLOT.left} x2={SVG_WIDTH - PLOT.right} y1={PLOT.top + plotHeight} y2={PLOT.top + plotHeight} />
        {mode === 'bar' && rows.map((row, rowIndex) => spec.series.map((series, seriesIndex) => {
          const value = getNumber(row[series.field]);
          if (value === null) return null;
          const y = scaleValue(value, range, PLOT.top + plotHeight, PLOT.top);
          const x = PLOT.left + rowIndex * groupWidth + (groupWidth - barWidth * spec.series.length) / 2 + seriesIndex * barWidth;
          return (
            <rect
              key={'bar-' + rowIndex + '-' + series.field}
              className="agent-chart-bar"
              fill={getColor(seriesIndex)}
              x={x}
              y={Math.min(y, baseline)}
              width={barWidth - 2}
              height={Math.max(1, Math.abs(baseline - y))}
              rx={3}
            >
              <title>{series.label + ': ' + formatValue(value)}</title>
            </rect>
          );
        }))}
        {mode !== 'bar' && seriesPoints.map(({ series, points }, seriesIndex) => {
          const color = getColor(seriesIndex);
          const path = pathFor(points);
          const firstPoint = points[0];
          const lastPoint = points[points.length - 1];
          const firstX = firstPoint ? xPosition(firstPoint.index, rows.length, plotWidth) : PLOT.left;
          const lastX = lastPoint ? xPosition(lastPoint.index, rows.length, plotWidth) : PLOT.left;
          const areaPath = path + ' L ' + lastX + ' ' + baseline + ' L ' + firstX + ' ' + baseline + ' Z';
          return (
            <g key={'series-' + series.field}>
              {mode === 'area' && points.length > 0 && <path className="agent-chart-area" fill={color} d={areaPath} />}
              {mode !== 'scatter' && points.length > 0 && <path className="agent-chart-line" stroke={color} d={path} />}
              {points.map((point) => {
                const x = xPosition(point.index, rows.length, plotWidth);
                const y = scaleValue(point.value, range, PLOT.top + plotHeight, PLOT.top);
                return (
                  <circle
                    key={series.field + '-' + point.index}
                    className="agent-chart-point"
                    cx={x}
                    cy={y}
                    fill={color}
                    r={mode === 'scatter' ? 5 : 4}
                  >
                    <title>{point.label + ': ' + series.label + ' ' + formatValue(point.value)}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
        {rows.map((row, index) => {
          if (index % xLabelStep !== 0 && index !== rows.length - 1) return null;
          return (
            <text
              key={'x-label-' + index}
              className="agent-chart-label"
              x={mode === 'bar' ? PLOT.left + index * groupWidth + groupWidth / 2 : xPosition(index, rows.length, plotWidth)}
              y={SVG_HEIGHT - 22}
              textAnchor="middle"
            >
              {getText(row[spec.xAxis.field])}
            </text>
          );
        })}
        <text className="agent-chart-axis-label" x={SVG_WIDTH / 2} y={SVG_HEIGHT - 4} textAnchor="middle">{spec.xAxis.label}</text>
        <text className="agent-chart-axis-label" transform={'translate(14 ' + (PLOT.top + plotHeight / 2) + ') rotate(-90)'} textAnchor="middle">{spec.yAxis.label}</text>
      </svg>
      <div className="agent-chart-legend" aria-label="Series do gráfico">
        {spec.series.map((series, index) => <span key={series.field}><i style={{ backgroundColor: getColor(index) }} />{series.label}</span>)}
      </div>
    </div>
  );
}

function PieChart({ spec }: { spec: ChartSpecification }) {
  const rows = getRows(spec);
  const series = spec.series[0];
  const field = series?.field ?? spec.yAxis.field;
  const slices = rows
    .map((row, index) => {
      const value = getNumber(row[field]);
      return value !== null && value > 0 ? { label: getText(row[spec.xAxis.field]), value, index } : null;
    })
    .filter((slice): slice is { label: string; value: number; index: number } => slice !== null);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (slices.length === 0 || total <= 0) {
    return <ChartEmpty />;
  }

  const centerX = 112;
  const centerY = 104;
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = slices.map((slice) => {
    const length = (slice.value / total) * circumference;
    const segment = { ...slice, length, offset };
    offset += length;
    return segment;
  });
  const strokeWidth = spec.type === 'donut' ? 30 : radius * 2;

  return (
    <div className="agent-chart-pie-layout">
      <svg className="agent-chart-pie" viewBox="0 0 224 208" role="img" aria-label={spec.title}>
        <title>{spec.title}</title>
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#2c2739" strokeWidth={strokeWidth} />
        {segments.map((segment) => (
          <circle
            key={segment.label + '-' + segment.index}
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={getColor(segment.index)}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.length + ' ' + circumference}
            strokeDashoffset={-segment.offset}
            transform={'rotate(-90 ' + centerX + ' ' + centerY + ')'}
          >
            <title>{segment.label + ': ' + formatValue(segment.value)}</title>
          </circle>
        ))}
      </svg>
      <ul className="agent-chart-pie-legend">
        {segments.map((segment) => <li key={'legend-' + segment.label + '-' + segment.index}><i style={{ backgroundColor: getColor(segment.index) }} /><span>{segment.label}</span><strong>{formatValue(segment.value)}</strong></li>)}
      </ul>
    </div>
  );
}

function HeatmapChart({ spec }: { spec: ChartSpecification }) {
  const rows = getRows(spec);
  const series = spec.series[0];
  const field = series?.field ?? spec.yAxis.field;
  const xLabels = Array.from(new Set(rows.map((row) => getText(row[spec.xAxis.field]))));
  const yLabels = Array.from(new Set(rows.map((row) => getText(row[spec.yAxis.field]))));
  const values = rows.map((row) => getNumber(row[field])).filter((value): value is number => value !== null);

  if (xLabels.length === 0 || yLabels.length === 0 || values.length === 0) {
    return <ChartEmpty />;
  }

  const range = getRange(values);
  const plotWidth = SVG_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = SVG_HEIGHT - PLOT.top - PLOT.bottom;
  const cellWidth = plotWidth / xLabels.length;
  const cellHeight = plotHeight / yLabels.length;

  return (
    <svg className="agent-chart-svg" viewBox={'0 0 ' + SVG_WIDTH + ' ' + SVG_HEIGHT} role="img" aria-label={spec.title}>
      <title>{spec.title}</title>
      {yLabels.map((yLabel, yIndex) => <text key={'heat-y-' + yLabel} className="agent-chart-label" x={PLOT.left - 8} y={PLOT.top + yIndex * cellHeight + cellHeight / 2 + 4} textAnchor="end">{yLabel}</text>)}
      {xLabels.map((xLabel, xIndex) => <text key={'heat-x-' + xLabel} className="agent-chart-label" x={PLOT.left + xIndex * cellWidth + cellWidth / 2} y={SVG_HEIGHT - 22} textAnchor="middle">{xLabel}</text>)}
      {yLabels.flatMap((yLabel, yIndex) => xLabels.map((xLabel, xIndex) => {
        const row = rows.find((candidate) => getText(candidate[spec.xAxis.field]) === xLabel && getText(candidate[spec.yAxis.field]) === yLabel);
        const value = row ? getNumber(row[field]) : null;
        if (value === null) return null;
        const ratio = (value - range.min) / (range.max - range.min || 1);
        return (
          <rect
            key={'heat-cell-' + xLabel + '-' + yLabel}
            x={PLOT.left + xIndex * cellWidth + 2}
            y={PLOT.top + yIndex * cellHeight + 2}
            width={Math.max(1, cellWidth - 4)}
            height={Math.max(1, cellHeight - 4)}
            rx={4}
            fill="#c6a2ff"
            fillOpacity={0.2 + ratio * 0.8}
          >
            <title>{xLabel + ' / ' + yLabel + ': ' + formatValue(value)}</title>
          </rect>
        );
      }))}
      <text className="agent-chart-axis-label" x={SVG_WIDTH / 2} y={SVG_HEIGHT - 4} textAnchor="middle">{spec.xAxis.label}</text>
      <text className="agent-chart-axis-label" transform={'translate(14 ' + (PLOT.top + plotHeight / 2) + ') rotate(-90)'} textAnchor="middle">{spec.yAxis.label}</text>
    </svg>
  );
}

function DataTable({ spec }: { spec: ChartSpecification }) {
  const rows = getRows(spec);
  const columns = getColumns(spec);
  if (rows.length === 0) return <ChartEmpty />;

  return (
    <div className="agent-chart-table-wrap">
      <table className="agent-chart-table">
        <thead><tr>{columns.map((column) => <th key={column.field} scope="col">{column.label}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={'row-' + rowIndex}>{columns.map((column) => <td key={column.field}>{formatValue(row[column.field])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function MetricChart({ spec }: { spec: ChartSpecification }) {
  const row = getRows(spec)[0];
  const series = spec.series[0];
  const field = series?.field ?? spec.yAxis.field;
  return (
    <div className="agent-chart-metric">
      <span>{series?.label ?? spec.yAxis.label}</span>
      <strong>{row ? formatValue(row[field]) : '—'}</strong>
      <small>{spec.description ?? spec.title}</small>
    </div>
  );
}

function renderChartBody(spec: ChartSpecification): ReactNode {
  switch (spec.type) {
    case 'kpi':
    case 'card':
      return <MetricChart spec={spec} />;
    case 'table':
      return <DataTable spec={spec} />;
    case 'line':
      return <CartesianChart spec={spec} mode="line" />;
    case 'area':
      return <CartesianChart spec={spec} mode="area" />;
    case 'bar':
    case 'comparison':
      return <CartesianChart spec={spec} mode="bar" />;
    case 'scatter':
      return <CartesianChart spec={spec} mode="scatter" />;
    case 'heatmap':
      return <HeatmapChart spec={spec} />;
    case 'pie':
    case 'donut':
      return <PieChart spec={spec} />;
    default:
      return <ChartEmpty />;
  }
}

export function AgentChart({ spec }: AgentChartProps) {
  return (
    <figure className="agent-chart">
      <div className="agent-chart-heading">
        <div>
          <p className="eyebrow">Visualizacao validada</p>
          <h3>{spec.title}</h3>
          {spec.description && <p>{spec.description}</p>}
        </div>
        <span className="agent-chart-type">{spec.type}</span>
      </div>
      <div className="agent-chart-body">{renderChartBody(spec)}</div>
      <figcaption>Fonte: {spec.source.tool} · dataset {spec.datasetVersion}</figcaption>
    </figure>
  );
}

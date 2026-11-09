import type { BatchSimulationResponse, SimulationResponse } from '../types';

type Props = {
  results: SimulationResponse[];
  summary: BatchSimulationResponse | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
};

const statusLabels = {
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  step_limit: 'Límite de pasos',
} as const;

export function InputList({ results, summary, selectedIndex, onSelect }: Props) {
  return (
    <section className="input-list panel" aria-labelledby="input-list-title">
      <div className="section-kicker">ENTRADAS</div>
      <h2 id="input-list-title">Resultados de ejecución</h2>
      {summary && (
        <div className="input-summary" aria-label="Resumen de resultados">
          <span>Total <b>{summary.total}</b></span>
          <span className="status-accepted">Aceptadas <b>{summary.accepted}</b></span>
          <span className="status-rejected">Rechazadas <b>{summary.rejected}</b></span>
          <span className="status-limit">Límite <b>{summary.step_limit}</b></span>
        </div>
      )}
      {results.length === 0 ? (
        <p className="empty-list">Ejecuta una configuración con entradas para ver sus resultados.</p>
      ) : (
        <div className="input-rows">
          {results.map((result, index) => (
            <button
              type="button"
              key={`${index}-${result.input}`}
              className={`input-row ${selectedIndex === index ? 'selected' : ''}`}
              aria-pressed={selectedIndex === index}
              onClick={() => onSelect(index)}
            >
              <code>{result.input === '' ? 'ε (vacía)' : result.input}</code>
              <span className={`input-status ${result.status}`}>{statusLabels[result.status]}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

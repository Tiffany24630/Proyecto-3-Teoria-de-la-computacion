import type { SimulationResponse } from '../types';

type Props = {
  result: SimulationResponse;
  finished: boolean;
};

function trimBlankEnds(tape: string[]): string[] {
  let start = 0;
  let end = tape.length;
  while (start < end && tape[start] === 'B') start += 1;
  while (end > start && tape[end - 1] === 'B') end -= 1;
  return tape.slice(start, end);
}

export function ResultPanel({ result, finished }: Props) {
  const verdict =
    result.status === 'accepted'
      ? 'Aceptada'
      : result.status === 'rejected'
        ? 'Rechazada'
        : 'Límite de pasos alcanzado';

  return (
    <section className="result-panel panel" aria-labelledby="result-panel-title">
      <div className="section-kicker">RESULTADO</div>
      <h3 id="result-panel-title">{finished ? verdict : 'Simulación en curso'}</h3>
      {finished && (
        <p className={`result-reason ${result.status}`}>
          {result.reason}
          {result.status === 'step_limit' && ' Esto no significa que la cadena haya sido rechazada matemáticamente.'}
        </p>
      )}
      <div className="result-facts">
        <span>Transiciones ejecutadas <b>{result.steps_count}</b></span>
        <span>Estado final <b>{result.final_state}</b></span>
        <span>Cinta final <code>{trimBlankEnds(result.final_tape).map((symbol) => symbol === 'B' ? '□' : symbol).join('') || 'ε'}</code></span>
      </div>
    </section>
  );
}

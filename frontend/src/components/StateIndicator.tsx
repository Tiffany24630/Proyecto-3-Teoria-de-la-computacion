import { Sparkles } from 'lucide-react';
import type { InstantaneousDescription, SimulationResponse } from '../types';

type Props = {
  step: InstantaneousDescription;
  stepIndex: number;
  stepsLength: number;
  result: SimulationResponse;
};

export function StateIndicator({ step, stepIndex, stepsLength, result }: Props) {
  const finished = stepIndex === stepsLength - 1;
  const verdict = finished
    ? result.status === 'accepted'
      ? 'Máquina detenida · entrada aceptada'
      : result.status === 'rejected'
        ? 'Máquina detenida · entrada rechazada'
        : 'Máquina detenida · límite de pasos'
    : 'Procesando entrada';

  return (
    <section className={`state-card ${finished && result.status === 'accepted' ? 'accepted' : ''}`}>
      <div className="section-kicker">ESTADO ACTUAL</div>
      <div className="state-line">
        <span className="state-pill">{step.state}</span>
        <span className="state-name">{verdict}</span>
        {finished && result.status === 'accepted' && <Sparkles size={18} aria-hidden="true" />}
      </div>
      <div className="state-track" aria-label={`Paso ${stepIndex + 1} de ${stepsLength}`}>
        <span style={{ width: `${(100 * (stepIndex + 1)) / stepsLength}%` }} />
      </div>
      <div className="state-meta">
        <span>Pasos ejecutados: <b>{step.step}</b></span>
        <span>Cabezal en posición: <b>{step.head_position}</b></span>
        <span>Leído: <b>{step.read_symbol === 'B' ? '□' : step.read_symbol}</b></span>
      </div>
    </section>
  );
}

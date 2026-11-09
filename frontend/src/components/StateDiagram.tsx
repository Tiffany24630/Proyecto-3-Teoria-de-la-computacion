import type { InstantaneousDescription } from '../types';

type Props = {
  steps: InstantaneousDescription[];
  currentState: string;
};

export function StateDiagram({ steps, currentState }: Props) {
  const states: string[] = [];
  const knownStates = new Set<string>();
  for (const step of steps) {
    if (!knownStates.has(step.state)) {
      states.push(step.state);
      knownStates.add(step.state);
    }
    if (step.transition && !knownStates.has(step.transition.next)) {
      states.push(step.transition.next);
      knownStates.add(step.transition.next);
    }
  }

  return (
    <section className="diagram-panel panel" aria-labelledby="diagram-title">
      <div className="section-kicker" id="diagram-title">ESTADOS VISITADOS EN LA EJECUCIÓN</div>
      {states.length === 0 ? (
        <p className="empty-list">No hay estados para mostrar.</p>
      ) : (
        <div className="state-diagram">
          {states.map((state, index) => (
            <span className={state === currentState ? 'current-state' : ''} key={state}>
              {state}
              {index < states.length - 1 && <i aria-hidden="true">→</i>}
            </span>
          ))}
        </div>
      )}
      <p className="explanation">El estado resaltado es <b>{currentState}</b>.</p>
    </section>
  );
}

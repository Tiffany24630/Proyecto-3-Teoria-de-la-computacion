import { useEffect, useRef, useState } from 'react';
import type { InstantaneousDescription } from '../types';

type Props = {
  step: InstantaneousDescription;
  previousStep: InstantaneousDescription | null;
};

export function getChangedCellIndex(
  previousStep: InstantaneousDescription | null,
  currentStep: InstantaneousDescription,
): number | null {
  const transition = currentStep.transition;
  if (!previousStep || !transition || transition.write[0] === previousStep.read_symbol) return null;

  // A left move from cell zero prepends a blank, shifting the written cell right by one.
  const grewOnLeft =
    currentStep.tape.length > previousStep.tape.length &&
    transition.move === 'L' &&
    previousStep.head_position === 0;
  return previousStep.head_position + (grewOnLeft ? 1 : 0);
}

export function Tape({ step, previousStep }: Props) {
  const tapeRef = useRef<HTMLDivElement>(null);
  const [extraCells, setExtraCells] = useState(2);
  const changedCell = getChangedCellIndex(previousStep, step);

  useEffect(() => {
    const element = tapeRef.current;
    if (!element) return;
    const update = () => {
      const available = element.clientWidth;
      const required = Math.ceil(available / 76) - step.tape.length;
      setExtraCells(Math.max(2, Math.min(24, required)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [step.tape.length]);

  const tapeLength = step.tape.length + extraCells;
  const isWindowed = tapeLength > 100;
  const start = isWindowed ? Math.max(0, step.head_position - 20) : 0;
  const end = isWindowed ? Math.min(tapeLength, step.head_position + 21) : tapeLength;
  const visibleTape = Array.from({ length: end - start }, (_, offset) => step.tape[start + offset] ?? 'B');
  return (
    <div className="tape-wrap">
      <div className="tape-label">CINTA</div>
      <div className="tape" ref={tapeRef}>
        {start > 0 && <span className="tape-window-edge" aria-label="Hay celdas anteriores">…</span>}
        {visibleTape.map((symbol, index) => {
          const tapeIndex = start + index;
          return (
          <div
            className={`cell ${tapeIndex === step.head_position ? 'active' : ''} ${tapeIndex === changedCell ? 'changed' : ''}`}
            key={tapeIndex}
          >
            {tapeIndex === step.head_position && (
              <div className="head">
                <span>⌄</span>
                <small>Cabezal · {symbol === 'B' ? '□' : symbol}</small>
              </div>
            )}
            <strong>{symbol === 'B' ? '□' : symbol}</strong>
            <em>{tapeIndex}</em>
          </div>
          );
        })}
        {end < tapeLength && <span className="tape-window-edge" aria-label="Hay celdas posteriores">…</span>}
      </div>
      <div className="tape-legend">
        <span><i className="dot active-dot" /> leyendo</span>
        <span><i className="dot changed-dot" /> escrito en este paso</span>
        <span>□ blanco</span>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { InstantaneousDescription } from '../types';

type Props = {
  steps: InstantaneousDescription[];
  currentStep: number;
  onSelect: (step: number) => void;
};

const ROW_HEIGHT = 120;
const VIRTUALIZE_AFTER = 2000;
const OVERSCAN = 5;

function describeStep(step: InstantaneousDescription): string {
  const windowSize = 120;
  let start = Math.max(0, step.head_position - Math.floor(windowSize / 2));
  let end = Math.min(step.tape.length, start + windowSize);
  start = Math.max(0, end - windowSize);
  const tape = step.tape.slice(start, end)
    .map((symbol, index) => `${start + index === step.head_position ? '▸' : ''}${symbol === 'B' ? '□' : symbol}`)
    .join('');
  return `${start > 0 ? '…' : ''}${tape}${end < step.tape.length ? '…' : ''}` || '□';
}

export function HistoryPanel({ steps, currentStep, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const virtualized = steps.length > VIRTUALIZE_AFTER;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const target = currentStep * ROW_HEIGHT;
    if (target < element.scrollTop || target + ROW_HEIGHT > element.scrollTop + element.clientHeight) {
      element.scrollTo({ top: Math.max(0, target - element.clientHeight / 2), behavior: 'smooth' });
    }
  }, [currentStep, steps.length]);

  const start = virtualized ? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN) : 0;
  const visibleCount = virtualized
    ? Math.ceil((scrollRef.current?.clientHeight ?? 420) / ROW_HEIGHT) + OVERSCAN * 2
    : steps.length;
  const end = Math.min(steps.length, start + visibleCount);

  return (
    <section className="history-panel panel" aria-labelledby="history-title">
      <div className="section-kicker" id="history-title">HISTORIAL DE DESCRIPCIONES INSTANTÁNEAS</div>
      <div
        className="history-list"
        ref={scrollRef}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        role="region"
        aria-label="Pasos de la simulación"
      >
        {virtualized && <div aria-hidden="true" style={{ height: start * ROW_HEIGHT }} />}
        {steps.slice(start, end).map((step, offset) => {
          const index = start + offset;
          const transition = step.transition;
          return (
            <button
              type="button"
              key={index}
              className={`history-row ${currentStep === index ? 'current' : ''}`}
              aria-current={currentStep === index ? 'step' : undefined}
              onClick={() => onSelect(index)}
            >
              <b>Paso {step.step}</b>
              <code>{step.state} · lee {step.read_symbol === 'B' ? '□' : step.read_symbol}</code>
              <span className="history-description">{describeStep(step)}</span>
              <span className="history-transition">
                {transition
                  ? `δ(${transition.state}, ${transition.read[0] === 'B' ? '□' : transition.read[0]}) escribe ${transition.write[0] === 'B' ? '□' : transition.write[0]} · ${transition.move}`
                  : 'inicio · sin transición'}
              </span>
            </button>
          );
        })}
        {virtualized && <div aria-hidden="true" style={{ height: Math.max(0, (steps.length - end) * ROW_HEIGHT) }} />}
      </div>
    </section>
  );
}

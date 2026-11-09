import { FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

type Props = {
  stepIndex: number;
  stepsLength: number;
  playing: boolean;
  speed: number;
  onPlayingChange: (playing: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onStep: (offset: number) => void;
  onReset: () => void;
};

export function SimulationControls({
  stepIndex,
  stepsLength,
  playing,
  speed,
  onPlayingChange,
  onSpeedChange,
  onStep,
  onReset,
}: Props) {
  const hasSteps = stepsLength > 0;
  const finished = hasSteps && stepIndex === stepsLength - 1;

  return (
    <section className="controls panel" aria-label="Controles de simulación">
      <div className="control-main">
        <button type="button" className="icon-btn" onClick={onReset} disabled={!hasSteps} aria-label="Reiniciar simulación" title="Reiniciar">
          <RotateCcw size={18} aria-hidden="true" />
          <span className="button-label">Reiniciar</span>
        </button>
        <button type="button" className="icon-btn" disabled={!hasSteps || stepIndex === 0} onClick={() => onStep(-1)} aria-label="Paso anterior" title="Paso anterior">
          <SkipBack size={19} aria-hidden="true" />
          <span className="button-label">Anterior</span>
        </button>
        <button
          type="button"
          className="play-btn"
          disabled={!hasSteps}
          onClick={() => (finished ? onReset() : onPlayingChange(!playing))}
        >
          {playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
          <span>{playing ? 'Pausar' : finished ? 'Volver a ejecutar' : 'Reproducir'}</span>
        </button>
        <button type="button" className="icon-btn" disabled={!hasSteps || finished} onClick={() => onStep(1)} aria-label="Paso siguiente" title="Paso siguiente">
          <SkipForward size={19} aria-hidden="true" />
          <span className="button-label">Siguiente</span>
        </button>
      </div>
      <div className="speed">
        <label htmlFor="simulation-speed">VELOCIDAD <b>{speed}x</b></label>
        <input
          id="simulation-speed"
          type="range"
          min="0.5"
          max="2"
          step="0.5"
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          disabled={!hasSteps}
        />
        <FastForward size={15} aria-hidden="true" />
      </div>
      <div className="step-count">
        <b>PASO {hasSteps ? String(stepIndex).padStart(2, '0') : '--'}</b>
        <span>ejecutados</span>
      </div>
    </section>
  );
}

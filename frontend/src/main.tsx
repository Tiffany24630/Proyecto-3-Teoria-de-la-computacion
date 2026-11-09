import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward, Sparkles } from 'lucide-react';
import './styles/animations.css';
import './styles/app.css';

type TapeStep = { step: number; state: string; tape: string[]; head_position: number; read_symbol: string; transition?: { write: string[]; move: 'L'|'R'|'S'; next: string } | null };
const demoSteps: TapeStep[] = [
  { step: 0, state: 'q0', tape: ['B','1','0','1','1','B','B'], head_position: 1, read_symbol: '1', transition: { write:['0'], move:'R', next:'q1' } },
  { step: 1, state: 'q1', tape: ['B','0','0','1','1','B','B'], head_position: 2, read_symbol: '0', transition: { write:['1'], move:'R', next:'q1' } },
  { step: 2, state: 'q1', tape: ['B','0','1','1','1','B','B'], head_position: 3, read_symbol: '1', transition: { write:['0'], move:'R', next:'q1' } },
  { step: 3, state: 'q1', tape: ['B','0','1','0','1','B','B'], head_position: 4, read_symbol: '1', transition: { write:['0'], move:'R', next:'qf' } },
  { step: 4, state: 'qf', tape: ['B','0','1','0','0','B','B'], head_position: 5, read_symbol: 'B', transition: null },
];

function Tape({ step }: { step: TapeStep }) {
  const original = ['B','1','0','1','1','B','B'];
  return <div className="tape-wrap"><div className="tape-label">CINTA</div><div className="tape">
    {step.tape.map((symbol, index) => <div className={`cell ${index === step.head_position ? 'active' : ''} ${symbol !== original[index] ? 'changed' : ''}`} key={`${index}-${step.step}`}>
      {index === step.head_position && <div className="head"><span>●</span><small>cabezal</small></div>}<strong>{symbol === 'B' ? '□' : symbol}</strong><em>{index}</em>
    </div>)}
  </div><div className="tape-legend"><span><i className="dot active-dot"/> leyendo</span><span><i className="dot changed-dot"/> modificado</span><span>□ blanco</span></div></div>;
}

function StateIndicator({ step }: { step: TapeStep }) { const done = step.state === 'qf'; return <section className={`state-card ${done ? 'accepted' : ''}`}><div className="section-kicker">ESTADO ACTUAL</div><div className="state-line"><span className="state-pill">{step.state}</span><span className="state-name">{done ? 'Aceptación' : 'Procesando entrada'}</span>{done && <Sparkles size={18}/>}</div><div className="state-track"><span style={{width: `${(step.step / 4) * 100}%`}}/></div><div className="state-meta"><span>Inicial: <b>q0</b></span><span>Final: <b>qf</b></span></div></section> }

function SimulationControls({ step, playing, setPlaying, speed, setSpeed, onStep, onReset }: { step: number; playing: boolean; setPlaying: (v:boolean)=>void; speed:number; setSpeed:(v:number)=>void; onStep:(n:number)=>void; onReset:()=>void }) {
  return <section className="controls panel"><div className="control-main"><button className="icon-btn" onClick={onReset} title="Reiniciar"><RotateCcw size={18}/></button><button className="icon-btn" disabled={step === 0} onClick={() => onStep(-1)} title="Paso anterior"><SkipBack size={19}/></button><button className="play-btn" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={20}/> : <Play size={20}/>}<span>{playing ? 'Pausar' : 'Reproducir'}</span></button><button className="icon-btn" disabled={step === 4} onClick={() => onStep(1)} title="Siguiente paso"><SkipForward size={19}/></button></div><div className="speed"><label>VELOCIDAD <b>{speed}x</b></label><input type="range" min="0.5" max="2" step="0.5" value={speed} onChange={e => setSpeed(Number(e.target.value))}/><FastForward size={15}/></div><div className="step-count"><b>PASO {String(step).padStart(2,'0')}</b><span>de 04</span></div></section>
}

function App() { const [stepIndex, setStepIndex] = useState(0); const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(1); const step = demoSteps[stepIndex];
  useEffect(() => { if (!playing) return; if (stepIndex >= demoSteps.length - 1) { setPlaying(false); return; } const id = window.setTimeout(() => setStepIndex(n => n + 1), 1000 / speed); return () => clearTimeout(id); }, [playing, stepIndex, speed]);
  const transition = useMemo(() => step.transition ? `${step.state} · ${step.read_symbol}  →  ${step.transition.write[0]} · ${step.transition.move}  →  ${step.transition.next}` : 'La máquina ha terminado', [step]);
  return <main><header className="topbar"><div><h1>Simulador de Máquina de Turing</h1><p>PROYECTO 3 · TEORÍA DE LA COMPUTACIÓN</p></div></header><div className="layout"><aside className="sidebar"><div className="side-label">MÁQUINA CARGADA</div><div className="machine-name"><span>MT</span><div><b>Complementador binario</b><small>Entrada: 1011</small></div></div><div className="side-divider"/><div className="side-label">RESUMEN</div><div className="stats"><div><b>5</b><span>Estados</span></div><div><b>4</b><span>Transiciones</span></div><div><b>1011</b><span>Entrada</span></div></div></aside><section className="content"><div className="title-row"><div><div className="eyebrow">SIMULACIÓN #001</div><h2>Complementador binario</h2></div><span className="result-tag">{step.state === 'qf' ? '✓ ACEPTADA' : 'EN EJECUCIÓN'}</span></div><StateIndicator step={step}/><div className="panel tape-panel"><Tape step={step}/></div><div className="bottom-grid"><SimulationControls step={stepIndex} playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} onStep={n => setStepIndex(i => Math.max(0, Math.min(4, i+n)))} onReset={() => {setStepIndex(0);setPlaying(false)}}/><section className="transition panel"><div className="section-kicker">ÚLTIMA TRANSICIÓN</div><code>{transition}</code><div className="transition-foot"><span>Lectura: <b>{step.read_symbol === 'B' ? 'blanco' : step.read_symbol}</b></span><span>Movimiento: <b>{step.transition?.move ?? '—'}</b></span></div></section></div></section></div></main> }
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

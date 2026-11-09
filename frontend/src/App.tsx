import { useEffect, useMemo, useState } from 'react';
import { ApiError, batch, validate } from './services/api';
import { examples } from './examples';
import {
  HistoryPanel,
  InputList,
  ResultPanel,
  SimulationControls,
  StateDiagram,
  StateIndicator,
  Tape,
  YamlEditor,
} from './components';
import type {
  BatchSimulationResponse,
  ExampleName,
  SimulationResponse,
  SimulationTab,
  ValidationResponse,
} from './types';
import './styles/animations.css';
import './styles/app.css';
import './styles/refinement.css';
import './styles/integration.css';

function getResultTag(result: SimulationResponse | null, finished: boolean): { label: string; className: string } {
  if (!result || !finished) return { label: 'EN EJECUCIÓN', className: '' };
  if (result.status === 'accepted') return { label: '✓ ACEPTADA', className: 'accepted' };
  if (result.status === 'rejected') return { label: '✗ RECHAZADA', className: 'rejected' };
  return { label: '⚠ LÍMITE', className: 'step_limit' };
}

export function App() {
  const [yamlText, setYamlText] = useState('');
  const [machineInfo, setMachineInfo] = useState<ValidationResponse | null>(null);
  const [results, setResults] = useState<SimulationResponse[]>([]);
  const [batchSummary, setBatchSummary] = useState<BatchSimulationResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [maxSteps, setMaxSteps] = useState(10_000);
  const [tab, setTab] = useState<SimulationTab>('tape');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [machineName, setMachineName] = useState('Máquina cargada');

  const selectedResult = selectedIndex === null ? null : results[selectedIndex] ?? null;
  const steps = selectedResult?.steps ?? [];
  const currentStep = steps[stepIndex] ?? null;
  const finished = currentStep !== null && stepIndex === steps.length - 1;
  const resultTag = getResultTag(selectedResult, finished);
  const yamlHasInputs = /^\s*inputs\s*:/m.test(yamlText);

  useEffect(() => {
    if (!playing || !currentStep) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => setStepIndex((index) => index + 1), 1000 / speed);
    return () => window.clearTimeout(timer);
  }, [currentStep, playing, speed, stepIndex, steps.length]);

  const transitionText = useMemo(() => {
    if (!currentStep?.transition) return 'Sin transición aplicada todavía.';
    const { state, read, write, move, next } = currentStep.transition;
    return `δ(${state}, ${read[0] === 'B' ? '□' : read[0]}) → (${next}, ${write[0] === 'B' ? '□' : write[0]}, ${move})`;
  }, [currentStep]);

  const updateYaml = (value: string) => {
    setYamlText(value);
    setMachineInfo(null);
    setResults([]);
    setBatchSummary(null);
    setSelectedIndex(null);
    setStepIndex(0);
    setPlaying(false);
    setError(null);
    setMachineName('Máquina cargada');
  };

  const loadExample = (name: ExampleName) => {
    setYamlText(examples[name].yaml);
    setMachineName(examples[name].label);
    setMachineInfo(null);
    setResults([]);
    setBatchSummary(null);
    setSelectedIndex(null);
    setStepIndex(0);
    setPlaying(false);
    setError(null);
  };

  const loadFile = (contents: string, fileName: string) => {
    updateYaml(contents);
    setMachineName(fileName);
  };

  const runBatch = async () => {
    setLoading(true);
    setError(null);
    setMachineInfo(null);
    setResults([]);
    setBatchSummary(null);
    setSelectedIndex(null);
    setStepIndex(0);
    setPlaying(false);

    try {
      const validation = await validate(yamlText);
      setMachineInfo(validation);
      const response = await batch(yamlText, maxSteps);
      setResults(response.results);
      setBatchSummary(response);
      setSelectedIndex(response.results.length > 0 ? 0 : null);
      setTab('tape');
    } catch (cause) {
      setMachineInfo(null);
      setResults([]);
      setBatchSummary(null);
      setSelectedIndex(null);
      setError(
        cause instanceof ApiError
          ? cause.message
          : cause instanceof Error
            ? cause.message
            : 'Ocurrió un error inesperado al ejecutar la simulación.',
      );
    } finally {
      setLoading(false);
    }
  };

  const selectInput = (index: number) => {
    setSelectedIndex(index);
    setStepIndex(0);
    setPlaying(false);
    setTab('tape');
  };

  const selectHistoryStep = (index: number) => {
    setStepIndex(index);
    setPlaying(false);
  };

  const reset = () => {
    setStepIndex(0);
    setPlaying(false);
  };

  return (
    <main>
      <header className="topbar">
        <div>
          <h1>Simulador de Máquina de Turing</h1>
          <p>PROYECTO 3 · TEORÍA DE LA COMPUTACIÓN</p>
        </div>
        <span className="api-indicator">API FastAPI · /api/v1</span>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="side-label">MÁQUINA CARGADA</div>
          <div className="machine-name">
            <span>MT</span>
            <div><b>{machineName}</b><small>{selectedResult ? `Entrada: ${selectedResult.input || 'ε (vacía)'}` : 'Sin entrada seleccionada'}</small></div>
          </div>
          <div className="side-divider" />
          <div className="side-label">RESUMEN</div>
          <div className="stats">
            <div><b>{machineInfo?.states_count ?? '—'}</b><span>Estados</span></div>
            <div><b>{machineInfo?.transitions_count ?? '—'}</b><span>Transiciones</span></div>
            <div><b>{machineInfo?.inputs_count ?? '—'}</b><span>Entradas</span></div>
          </div>
          {machineInfo && <p className="machine-validation">{machineInfo.message}</p>}
        </aside>

        <section className="content">
          <YamlEditor
            yamlText={yamlText}
            loading={loading}
            maxSteps={maxSteps}
            yamlHasInputs={yamlHasInputs}
            onMaxStepsChange={setMaxSteps}
            onYamlChange={updateYaml}
            onExample={loadExample}
            onFileLoaded={loadFile}
            onFileError={setError}
            onRun={runBatch}
          />

          {error && <div className="error-banner" role="alert"><b>Error:</b> {error}</div>}
          {machineInfo && machineInfo.inputs_count === 0 && !error && (
            <div className="info-banner" role="status">La configuración se validó, pero no contiene entradas para simular.</div>
          )}

          {!selectedResult || !currentStep ? (
            <section className="empty-simulation panel" role="status">
              <span className="empty-symbol">λ</span>
              <h2>{loading ? 'Ejecutando simulación…' : 'Carga un YAML y pulsa Ejecutar'}</h2>
              <p>{loading ? 'Validando la máquina y simulando sus entradas.' : 'Elige uno de los ejemplos, carga un archivo .yaml/.yml o escribe una configuración.'}</p>
              {loading && <div className="loading-bar"><span /></div>}
            </section>
          ) : (
            <>
              <InputList
                results={results}
                summary={batchSummary}
                selectedIndex={selectedIndex}
                onSelect={selectInput}
              />
              <div className="title-row simulation-title">
                <div><div className="eyebrow">SIMULACIÓN · ENTRADA {selectedIndex === null ? '' : selectedIndex + 1}</div><h2>{selectedResult.input === '' ? 'ε (vacía)' : selectedResult.input}</h2></div>
                <span className={`result-tag ${resultTag.className}`}>{resultTag.label}</span>
              </div>
              <div className="view-tabs" role="tablist" aria-label="Vistas de simulación">
                <button role="tab" aria-selected={tab === 'tape'} className={tab === 'tape' ? 'active' : ''} onClick={() => setTab('tape')}>Cinta</button>
                <button role="tab" aria-selected={tab === 'diagram'} className={tab === 'diagram' ? 'active' : ''} onClick={() => setTab('diagram')}>Estados</button>
                <button role="tab" aria-selected={tab === 'history'} className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>Historial ({steps.length})</button>
              </div>
              <StateIndicator
                step={currentStep}
                stepIndex={stepIndex}
                stepsLength={steps.length}
                result={selectedResult}
              />
              {tab === 'tape' ? (
                <>
                  <ResultPanel result={selectedResult} finished={finished} />
                  <div className="panel tape-panel">
                    <Tape step={currentStep} previousStep={steps[stepIndex - 1] ?? null} />
                  </div>
                  <div className="bottom-grid">
                    <SimulationControls
                      stepIndex={stepIndex}
                      stepsLength={steps.length}
                      playing={playing}
                      speed={speed}
                      onPlayingChange={setPlaying}
                      onSpeedChange={setSpeed}
                      onStep={(offset) => {
                        setPlaying(false);
                        setStepIndex((index) => Math.max(0, Math.min(steps.length - 1, index + offset)));
                      }}
                      onReset={reset}
                    />
                    <section className="transition panel">
                      <div className="section-kicker">{currentStep.transition ? 'TRANSICIÓN PARA LLEGAR A ESTE PASO' : 'INICIO DE LA EJECUCIÓN'}</div>
                      <code>{transitionText}</code>
                      <div className="transition-foot">
                        <span>Estado actual: <b>{currentStep.state}</b></span>
                        <span>Posición: <b>{currentStep.head_position}</b></span>
                      </div>
                    </section>
                  </div>
                </>
              ) : tab === 'history' ? (
                <HistoryPanel steps={steps} currentStep={stepIndex} onSelect={selectHistoryStep} />
              ) : (
                <StateDiagram steps={steps} currentState={currentStep.state} />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

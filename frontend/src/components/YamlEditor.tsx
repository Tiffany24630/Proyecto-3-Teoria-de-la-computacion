import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { FileUp, Play } from 'lucide-react';
import type { ExampleName } from '../types';

type Props = {
  yamlText: string;
  loading: boolean;
  maxSteps: number;
  yamlHasInputs: boolean;
  onMaxStepsChange: (value: number) => void;
  onYamlChange: (value: string) => void;
  onExample: (name: ExampleName) => void;
  onFileLoaded: (contents: string, fileName: string) => void;
  onFileError: (message: string) => void;
  onRun: () => void;
};

export function YamlEditor({
  yamlText,
  loading,
  maxSteps,
  yamlHasInputs,
  onMaxStepsChange,
  onYamlChange,
  onExample,
  onFileLoaded,
  onFileError,
  onRun,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        onFileError('No fue posible leer el contenido del archivo.');
        return;
      }
      onFileLoaded(reader.result, file.name);
    };
    reader.onerror = () => onFileError('No fue posible leer el archivo YAML seleccionado.');
    reader.readAsText(file);
  };

  return (
    <section className="yaml-editor panel" aria-labelledby="yaml-title">
      <div className="yaml-editor-heading">
        <div>
          <div className="section-kicker">CONFIGURACIÓN</div>
          <h2 id="yaml-title">Máquina de Turing</h2>
        </div>
        <div className="yaml-examples">
          <button type="button" className="icon-btn" disabled={loading} onClick={() => onExample('recognizer')}>
            Ejemplo aⁿbⁿ
          </button>
          <button type="button" className="icon-btn" disabled={loading} onClick={() => onExample('alterer')}>
            Ejemplo binario
          </button>
        </div>
      </div>
      <label className="visually-hidden" htmlFor="yaml-input">
        Configuración YAML de la máquina
      </label>
      <textarea
        id="yaml-input"
        className="yaml-textarea"
        spellCheck={false}
        disabled={loading}
        value={yamlText}
        onChange={(event) => onYamlChange(event.target.value)}
        placeholder="Pega o escribe aquí la configuración YAML..."
      />
      <div className="yaml-editor-footer">
        <div className="yaml-editor-actions">
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept=".yaml,.yml"
            disabled={loading}
            onChange={handleFile}
            aria-label="Seleccionar archivo YAML"
          />
          <button type="button" className="icon-btn" disabled={loading} onClick={() => fileInput.current?.click()}>
            <FileUp size={16} aria-hidden="true" />
            Cargar YAML
          </button>
          <button type="button" className="play-btn" disabled={loading || !yamlText.trim()} onClick={onRun}>
            <Play size={16} aria-hidden="true" />
            {loading ? 'Ejecutando…' : 'Ejecutar'}
          </button>
          <label className="max-steps-control">
            Límite de pasos
            <input
              type="number"
              min="1"
              max="1000000"
              value={maxSteps}
              disabled={loading}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isInteger(value) && value >= 1 && value <= 1_000_000) {
                  onMaxStepsChange(value);
                }
              }}
            />
          </label>
        </div>
        {!yamlHasInputs && yamlText.trim() && (
          <span className="yaml-hint">Este YAML no define entradas; la simulación por lotes no tendrá resultados.</span>
        )}
      </div>
    </section>
  );
}

# Proyecto-3-Teoria-de-la-computacion
Backend para una Máquina de Turing de **una sola cinta**, implementado con Python, FastAPI y PyYAML.

## Requisitos
- Python 3.11 o superior recomendado.
- `pip`.

## Instalación
Desde la carpeta `backend`:

```bash
python -m venv .venv
```

Activar el entorno virtual:

- Windows PowerShell: `.venv\Scripts\Activate.ps1`
- Windows CMD: `.venv\Scripts\activate.bat`
- macOS/Linux: `source .venv/bin/activate`

Instalar dependencias y ejecutar:

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

La API estará disponible en `http://127.0.0.1:8000`. La documentación interactiva está en `http://127.0.0.1:8000/docs`.

## Endpoints
- `GET /health`: comprueba que el servidor está activo.
- `POST /api/v1/machines/validate`: valida un YAML sin ejecutar la máquina.
- `POST /api/v1/simulations`: simula una cadena con una máquina descrita en YAML.
- `POST /api/v1/simulations/batch`: simula todas las entradas incluidas en el YAML.

Los endpoints reciben JSON con una propiedad `yaml` que contiene el documento YAML como texto. Esto permite que el editor de la interfaz envíe el contenido sin tener que guardar primero un archivo en el servidor.

### Ejemplo de solicitud
```json
{
  "yaml": "mt:\n  states: [q0, qf]\n  input_alphabet: [a]\n  tape_alphabet: [a, B]\n  blank: B\n  initial_state: q0\n  accept_states: [qf]\n  transitions:\n    - state: q0\n      read: [a]\n      write: [a]\n      move: R\n      next: qf\n  inputs: [a]\n",
  "input": "a",
  "max_steps": 10000
}
```

## Formato YAML
El formato esperado sigue la guía del proyecto:

```yaml
mt:
  states: [q0, q1, qf]
  input_alphabet: [a, b]
  tape_alphabet: [a, b, B, X, Y]
  blank: B
  initial_state: q0
  accept_states: [qf]
  transitions:
    - state: q0
      read: [a]
      write: [X]
      move: R
      next: q1
  inputs:
    - "aabb"
```

El ejemplo de arriba es ilustrativo; las transiciones de una cinta usan listas de un elemento para `read` y `write`. Si se omite `blank`, se usa `B`.

### Reglas implementadas
- La máquina tiene exactamente una cinta.
- Cada transición debe leer y escribir exactamente un símbolo.
- `move` admite `L`, `R` y `S` (sin movimiento).
- No encontrar una transición aplicable detiene la máquina. El resultado será `accepted` si el estado actual es de aceptación; en caso contrario será `rejected`.
- Si se alcanza `max_steps` sin detenerse, el estado será `step_limit`. Esto evita que una máquina con ciclos bloquee el servidor; no significa que la cadena haya sido rechazada matemáticamente.
- Se valida que estados, alfabetos, símbolos y referencias de transiciones sean consistentes.
- Se conserva el historial completo de descripciones instantáneas para que el frontend pueda reproducirlo.

## Contrato de respuesta
Cada paso contiene:

- `step`: número de paso, empezando en 0.
- `state`: estado de la máquina.
- `head_position`: posición del cabezal dentro de `tape`.
- `tape`: contenido de la cinta en ese instante.
- `read_symbol`: símbolo leído.
- `transition`: transición aplicada en ese paso, o `null` si la máquina se detuvo.

La respuesta final incluye `status`, `accepted`, `reason`, `steps_count`, `final_state`, `final_tape`, `final_head_position` y `steps`.

La cinta devuelta incluye las celdas representadas desde la primera posición almacenada hasta la última celda necesaria para la ejecución. `head_position` es un índice dentro del arreglo `tape`, no una coordenada absoluta de una cinta infinita.

## Ejemplos incluidos
- `examples/recognizer.yaml`: máquina que reconoce cadenas no vacías de `a` seguidas por `b` en igual cantidad (`a^n b^n`, n >= 1).
- `examples/alterer.yaml`: máquina alteradora que complementa cada bit (0→1 y 1→0).
- `examples/invalid.yaml`: configuración deliberadamente inválida para probar validaciones.

## Pruebas
```bash
pip install pytest httpx
pytest
```

## Límites de responsabilidad
Este backend no implementa la interfaz gráfica ni animaciones. Entrega datos estructurados para que el frontend represente cada descripción instantánea. El backend no asume cómo se verán la cinta o los controles.
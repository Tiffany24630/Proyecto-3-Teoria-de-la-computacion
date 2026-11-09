const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

export type ValidationResponse = {
  valid: boolean;
  states_count: number;
  transitions_count: number;
  inputs_count: number;
  message: string;
};

export type Transition = {
  state: string;
  read: string[];
  write: string[];
  move: 'L' | 'R' | 'S';
  next: string;
};

export type InstantaneousDescription = {
  step: number;
  state: string;
  tape: string[];
  head_position: number;
  read_symbol: string;
  transition: Transition | null;
};

export type SimulationResponse = {
  input: string;
  status: 'accepted' | 'rejected' | 'step_limit';
  accepted: boolean;
  reason: string;
  steps_count: number;
  final_state: string;
  final_tape: string[];
  final_head_position: number;
  steps: InstantaneousDescription[];
};

export type BatchSimulationResponse = {
  results: SimulationResponse[];
  total: number;
  accepted: number;
  rejected: number;
  step_limit: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly detail: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let responseBody: unknown;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as unknown;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`El servidor devolvió una respuesta JSON inválida (${response.status}).`);
      }
      throw error;
    }
  }

  if (!response.ok) {
    const detail =
      typeof responseBody === 'object' && responseBody !== null && 'detail' in responseBody
        ? responseBody.detail
        : undefined;
    const message =
      typeof detail === 'string'
        ? detail
        : detail === undefined
          ? response.statusText || `Error HTTP ${response.status}`
          : JSON.stringify(detail);
    throw new ApiError(message, response.status, detail);
  }

  return responseBody as T;
}

export function validate(yaml: string): Promise<ValidationResponse> {
  return post('/machines/validate', { yaml });
}

export function simulate(
  yaml: string,
  input: string,
  maxSteps?: number,
): Promise<SimulationResponse> {
  return post('/simulations', {
    yaml,
    input,
    ...(maxSteps === undefined ? {} : { max_steps: maxSteps }),
  });
}

export function batch(yaml: string, maxSteps?: number): Promise<BatchSimulationResponse> {
  return post('/simulations/batch', {
    yaml,
    ...(maxSteps === undefined ? {} : { max_steps: maxSteps }),
  });
}

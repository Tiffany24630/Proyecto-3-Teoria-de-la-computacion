import type { ExampleName } from './types';

export const examples: Record<ExampleName, { label: string; yaml: string }> = {
  recognizer: {
    label: 'Reconocedor aⁿbⁿ',
    yaml: `# Reconoce el lenguaje a^n b^n, con n >= 1.
# Marca la primera a disponible con X, busca una b sin marcar y la marca con Y; regresa al inicio y repite.
mt:
  states: [q0, q1, q2, q3, q_accept]
  input_alphabet: [a, b]
  tape_alphabet: [a, b, X, Y, B]
  blank: B
  initial_state: q0
  accept_states: [q_accept]
  transitions:
    - state: q0
      read: [X]
      write: [X]
      move: R
      next: q0
    - state: q0
      read: [a]
      write: [X]
      move: R
      next: q1
    - state: q0
      read: [Y]
      write: [Y]
      move: R
      next: q3
    - state: q1
      read: [a]
      write: [a]
      move: R
      next: q1
    - state: q1
      read: [Y]
      write: [Y]
      move: R
      next: q1
    - state: q1
      read: [b]
      write: [Y]
      move: L
      next: q2
    - state: q2
      read: [a]
      write: [a]
      move: L
      next: q2
    - state: q2
      read: [b]
      write: [b]
      move: L
      next: q2
    - state: q2
      read: [X]
      write: [X]
      move: L
      next: q2
    - state: q2
      read: [Y]
      write: [Y]
      move: L
      next: q2
    - state: q2
      read: [B]
      write: [B]
      move: R
      next: q0
    - state: q3
      read: [Y]
      write: [Y]
      move: R
      next: q3
    - state: q3
      read: [B]
      write: [B]
      move: S
      next: q_accept
  inputs:
    - "aaabbb"
    - "ab"
    - "aabb"
    - "aab"
    - "aabbb"
    - "ba"
    - ""
`,
  },
  alterer: {
    label: 'Complementador binario',
    yaml: `# Complementa cada bit de una cadena binaria.
mt:
  states: [q0, q_accept]
  input_alphabet: ["0", "1"]
  tape_alphabet: ["0", "1", B]
  blank: B
  initial_state: q0
  accept_states: [q_accept]
  transitions:
    - state: q0
      read: ["0"]
      write: ["1"]
      move: R
      next: q0
    - state: q0
      read: ["1"]
      write: ["0"]
      move: R
      next: q0
    - state: q0
      read: [B]
      write: [B]
      move: S
      next: q_accept
  inputs:
    - "01010"
    - "11001"
    - "10101"
    - "00110"
`,
  },
};

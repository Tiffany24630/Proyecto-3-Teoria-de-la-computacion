from backend.app.parser import parse_machine
from backend.app.simulator import simulate

ACCEPTS_A = '''
mt:
  states: [q0, qf]
  input_alphabet: [a]
  tape_alphabet: [a, B]
  blank: B
  initial_state: q0
  accept_states: [qf]
  transitions:
    - state: q0
      read: [a]
      write: [a]
      move: R
      next: qf
  inputs: [a]
'''

def test_acceptance_and_history():
    machine = parse_machine(ACCEPTS_A)
    result = simulate(machine, "a")

    assert result["status"] == "accepted"
    assert result["accepted"] is True
    assert result["steps_count"] == 1
    assert len(result["steps"]) == 2
    assert result["steps"][0]["step"] == 0

def test_missing_transition_rejects():
    machine = parse_machine(ACCEPTS_A)
    result = simulate(machine, "")

    assert result["status"] == "rejected"
    assert result["accepted"] is False

def test_invalid_input_symbol_raises():
    machine = parse_machine(ACCEPTS_A)

    try:
        simulate(machine, "b")

    except ValueError as exc:
        assert "input_alphabet" in str(exc)

    else:
        raise AssertionError("Se esperaba ValueError")

def test_step_limit():
    yaml_text = '''
    mt:
      states: [q0, qf]
      input_alphabet: [a]
      tape_alphabet: [a, B]
      blank: B
      initial_state: q0
      accept_states: [qf]
      transitions:
        - state: q0
          read: [a]
          write: [a]
          move: S
          next: q0
      inputs: [a]
    '''
    machine = parse_machine(yaml_text)
    result = simulate(machine, "a", max_steps=3)

    assert result["status"] == "step_limit"
    assert result["steps_count"] == 3
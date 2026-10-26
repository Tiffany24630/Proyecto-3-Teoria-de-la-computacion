import pytest
from backend.app.parser import MachineConfigError, parse_machine

VALID_YAML = '''
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

def test_parse_valid_machine():
    machine = parse_machine(VALID_YAML)

    assert machine.initial_state == "q0"
    assert len(machine.transitions) == 1
    assert machine.inputs == ("a",)

def test_unknown_initial_state_is_rejected():
    invalid = VALID_YAML.replace("initial_state: q0", "initial_state: missing")

    with pytest.raises(MachineConfigError):
        parse_machine(invalid)

def test_duplicate_transition_is_rejected():
    invalid = VALID_YAML.replace(
        "  inputs: [a]",
        '''    - state: q0
      read: [a]
      write: [a]
      move: R
      next: qf
  inputs: [a]'''
    )
    
    with pytest.raises(MachineConfigError):
        parse_machine(invalid)
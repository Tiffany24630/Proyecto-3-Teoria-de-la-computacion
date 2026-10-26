from __future__ import annotations
from backend.app.parser import Machine, Transition

def _transition_view(transition: Transition | None) -> dict | None:
    if transition is None:
        return None
    return {
        "state": transition.state,
        "read": [transition.read],
        "write": [transition.write],
        "move": transition.move,
        "next": transition.next_state,
    }

def simulate(machine: Machine, input_string: str, max_steps: int = 10000) -> dict:
    invalid = sorted(set(input_string) - set(machine.input_alphabet))

    if invalid:
        raise ValueError(f"La entrada contiene símbolos fuera de input_alphabet: {invalid}.")

    tape = list(input_string) if input_string else []

    if not tape:
        tape = [machine.blank]
        
    head = 0
    state = machine.initial_state
    steps: list[dict] = []

    def record(step_number: int, transition: Transition | None) -> None:
        steps.append({
            "step": step_number,
            "state": state,
            "tape": tape.copy(),
            "head_position": head,
            "read_symbol": tape[head],
            "transition": _transition_view(transition),
        })

    record(0, None)
    transition_count = 0

    while state not in machine.accept_states:
        current_symbol = tape[head]
        transition = machine.transitions.get((state, current_symbol))

        if transition is None:
            return {
                "input": input_string,
                "status": "rejected",
                "accepted": False,
                "reason": (
                    f"No existe transición para el estado '{state}' "
                    f"con el símbolo '{current_symbol}'."
                ),
                "steps_count": transition_count,
                "final_state": state,
                "final_tape": tape.copy(),
                "final_head_position": head,
                "steps": steps,
            }

        if transition_count >= max_steps:
            return {
                "input": input_string,
                "status": "step_limit",
                "accepted": False,
                "reason": f"Se alcanzó el límite de {max_steps} transiciones.",
                "steps_count": transition_count,
                "final_state": state,
                "final_tape": tape.copy(),
                "final_head_position": head,
                "steps": steps,
            }

        tape[head] = transition.write
        state = transition.next_state

        if transition.move == "R":
            head += 1

            if head >= len(tape):
                tape.append(machine.blank)

        elif transition.move == "L":
            head -= 1

            if head < 0:
                tape.insert(0, machine.blank)
                head = 0

        transition_count += 1
        record(transition_count, transition)

    return {
        "input": input_string,
        "status": "accepted",
        "accepted": True,
        "reason": f"La máquina terminó en el estado de aceptación '{state}'.",
        "steps_count": transition_count,
        "final_state": state,
        "final_tape": tape.copy(),
        "final_head_position": head,
        "steps": steps,
    }

def simulate_batch(machine: Machine, max_steps: int = 10000) -> list[dict]:
    return [simulate(machine, input_string, max_steps) for input_string in machine.inputs]
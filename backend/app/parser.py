from __future__ import annotations
from dataclasses import dataclass
from typing import Any
import yaml

class MachineConfigError(ValueError):
    """Error de formato o consistencia en la configuración de la máquina."""

@dataclass(frozen=True)
class Transition:
    state: str
    read: str
    write: str
    move: str
    next_state: str

@dataclass(frozen=True)
class Machine:
    states: tuple[str, ...]
    input_alphabet: tuple[str, ...]
    tape_alphabet: tuple[str, ...]
    blank: str
    initial_state: str
    accept_states: tuple[str, ...]
    transitions: dict[tuple[str, str], Transition]
    inputs: tuple[str, ...]

def _string_list(value: Any, field: str, *, allow_empty: bool = False) -> list[str]:
    if not isinstance(value, list):
        raise MachineConfigError(f"'{field}' debe ser una lista.")
    
    if not allow_empty and not value:
        raise MachineConfigError(f"'{field}' no puede estar vacía.")
    
    if any(not isinstance(item, str) or item == "" for item in value):
        raise MachineConfigError(f"Todos los elementos de '{field}' deben ser cadenas no vacías.")
    
    if len(value) != len(set(value)):
        raise MachineConfigError(f"'{field}' no debe contener elementos duplicados.")
    
    return value

def parse_machine(yaml_text: str) -> Machine:
    try:
        document = yaml.safe_load(yaml_text)

    except yaml.YAMLError as exc:
        raise MachineConfigError(f"El YAML no tiene una sintaxis válida: {exc}") from exc

    if not isinstance(document, dict):
        raise MachineConfigError("El documento debe contener un objeto raíz con la propiedad 'mt'.")
    
    raw = document.get("mt")

    if not isinstance(raw, dict):
        raise MachineConfigError("Falta la propiedad raíz 'mt' o no es un objeto.")

    required = [
        "states", "input_alphabet", "tape_alphabet",
        "initial_state", "accept_states", "transitions",
    ]
    missing = [key for key in required if key not in raw]

    if missing:
        raise MachineConfigError("Faltan propiedades obligatorias: " + ", ".join(missing))

    states = _string_list(raw["states"], "states")
    input_alphabet = _string_list(raw["input_alphabet"], "input_alphabet", allow_empty=True)
    tape_alphabet = _string_list(raw["tape_alphabet"], "tape_alphabet")
    accept_states = _string_list(raw["accept_states"], "accept_states", allow_empty=True)

    initial_state = raw["initial_state"]

    if not isinstance(initial_state, str) or not initial_state:
        raise MachineConfigError("'initial_state' debe ser una cadena no vacía.")
    
    blank = raw.get("blank", "B")

    if not isinstance(blank, str) or len(blank) != 1:
        raise MachineConfigError("'blank' debe ser un símbolo de un solo carácter.")

    for symbol in input_alphabet:
        if len(symbol) != 1:
            raise MachineConfigError(f"El símbolo de entrada '{symbol}' debe tener un solo carácter.")
        
    for symbol in tape_alphabet:
        if len(symbol) != 1:
            raise MachineConfigError(f"El símbolo de cinta '{symbol}' debe tener un solo carácter.")

    if not set(input_alphabet).issubset(set(tape_alphabet)):
        raise MachineConfigError("'tape_alphabet' debe incluir todos los símbolos de 'input_alphabet'.")
    
    if blank not in tape_alphabet:
        raise MachineConfigError(f"El símbolo en blanco '{blank}' debe pertenecer a 'tape_alphabet'.")
    
    if initial_state not in states:
        raise MachineConfigError("'initial_state' debe pertenecer a 'states'.")
    
    if not set(accept_states).issubset(set(states)):
        raise MachineConfigError("Todos los elementos de 'accept_states' deben pertenecer a 'states'.")

    raw_transitions = raw["transitions"]

    if not isinstance(raw_transitions, list):
        raise MachineConfigError("'transitions' debe ser una lista.")

    transitions: dict[tuple[str, str], Transition] = {}

    for index, item in enumerate(raw_transitions):
        label = f"transitions[{index}]"

        if not isinstance(item, dict):
            raise MachineConfigError(f"'{label}' debe ser un objeto.")
        
        for key in ("state", "read", "write", "move", "next"):
            if key not in item:
                raise MachineConfigError(f"Falta '{key}' en '{label}'.")

        state = item["state"]
        next_state = item["next"]

        if state not in states:
            raise MachineConfigError(f"El estado '{state}' de '{label}' no existe.")
        
        if next_state not in states:
            raise MachineConfigError(f"El estado siguiente '{next_state}' de '{label}' no existe.")

        read = _string_list(item["read"], f"{label}.read")
        write = _string_list(item["write"], f"{label}.write")

        if len(read) != 1 or len(write) != 1:
            raise MachineConfigError(
                f"'{label}.read' y '{label}.write' deben contener exactamente un símbolo "
                "porque el proyecto requiere una máquina de una sola cinta."
            )
        
        read_symbol, write_symbol = read[0], write[0]

        if len(read_symbol) != 1 or read_symbol not in tape_alphabet:
            raise MachineConfigError(f"Símbolo leído inválido '{read_symbol}' en '{label}'.")
        
        if len(write_symbol) != 1 or write_symbol not in tape_alphabet:
            raise MachineConfigError(f"Símbolo escrito inválido '{write_symbol}' en '{label}'.")

        move = item["move"]

        if move not in ("L", "R", "S"):
            raise MachineConfigError(f"'{label}.move' debe ser L, R o S.")
        
        key = (state, read_symbol)

        if key in transitions:
            raise MachineConfigError(f"Transición duplicada para estado '{state}' y símbolo '{read_symbol}'.")
        
        transitions[key] = Transition(state, read_symbol, write_symbol, move, next_state)

    raw_inputs = raw.get("inputs", [])

    if not isinstance(raw_inputs, list) or any(not isinstance(s, str) for s in raw_inputs):
        raise MachineConfigError("'inputs' debe ser una lista de cadenas.")
    
    for value in raw_inputs:
        invalid = sorted(set(value) - set(input_alphabet))

        if invalid:
            raise MachineConfigError(f"La entrada '{value}' contiene símbolos fuera de 'input_alphabet': {invalid}.")

    return Machine(
        states=tuple(states),
        input_alphabet=tuple(input_alphabet),
        tape_alphabet=tuple(tape_alphabet),
        blank=blank,
        initial_state=initial_state,
        accept_states=tuple(accept_states),
        transitions=transitions,
        inputs=tuple(raw_inputs),
    )
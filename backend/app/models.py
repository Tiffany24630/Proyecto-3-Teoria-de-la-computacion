from typing import Any, Literal
from pydantic import BaseModel, Field

class YamlRequest(BaseModel):
    yaml: str = Field(min_length=1, description="Documento YAML completo de la Máquina de Turing")

class SimulationRequest(YamlRequest):
    input: str = Field(description="Cadena que se colocará inicialmente en la cinta")
    max_steps: int = Field(default=10000, ge=1, le=1_000_000)

class BatchSimulationRequest(YamlRequest):
    max_steps: int = Field(default=10000, ge=1, le=1_000_000)

class ValidationResponse(BaseModel):
    valid: bool
    states_count: int
    transitions_count: int
    inputs_count: int
    message: str

class TransitionView(BaseModel):
    state: str
    read: list[str]
    write: list[str]
    move: Literal["L", "R", "S"]
    next: str

class InstantaneousDescription(BaseModel):
    step: int
    state: str
    tape: list[str]
    head_position: int
    read_symbol: str
    transition: TransitionView | None = None

class SimulationResponse(BaseModel):
    input: str
    status: Literal["accepted", "rejected", "step_limit"]
    accepted: bool
    reason: str
    steps_count: int
    final_state: str
    final_tape: list[str]
    final_head_position: int
    steps: list[InstantaneousDescription]

class BatchSimulationResponse(BaseModel):
    results: list[SimulationResponse]
    total: int
    accepted: int
    rejected: int
    step_limit: int
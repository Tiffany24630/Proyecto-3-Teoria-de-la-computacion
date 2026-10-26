from fastapi import APIRouter, HTTPException
from .models import BatchSimulationRequest, BatchSimulationResponse, SimulationRequest, SimulationResponse, ValidationResponse, YamlRequest
from .parser import MachineConfigError, parse_machine
from .simulator import simulate, simulate_batch

router = APIRouter()

@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@router.post("/api/v1/machines/validate", response_model=ValidationResponse)
def validate_machine(request: YamlRequest) -> ValidationResponse:
    try:
        machine = parse_machine(request.yaml)

    except MachineConfigError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return ValidationResponse(
        valid=True,
        states_count=len(machine.states),
        transitions_count=len(machine.transitions),
        inputs_count=len(machine.inputs),
        message="La configuración YAML es válida.",
    )

@router.post("/api/v1/simulations", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest) -> SimulationResponse:
    try:
        machine = parse_machine(request.yaml)
        result = simulate(machine, request.input, request.max_steps)

    except MachineConfigError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    
    return SimulationResponse(**result)

@router.post("/api/v1/simulations/batch", response_model=BatchSimulationResponse)
def run_batch(request: BatchSimulationRequest) -> BatchSimulationResponse:
    try:
        machine = parse_machine(request.yaml)
        results = simulate_batch(machine, request.max_steps)

    except MachineConfigError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return BatchSimulationResponse(
        results=results,
        total=len(results),
        accepted=sum(1 for item in results if item["status"] == "accepted"),
        rejected=sum(1 for item in results if item["status"] == "rejected"),
        step_limit=sum(1 for item in results if item["status"] == "step_limit"),
    )
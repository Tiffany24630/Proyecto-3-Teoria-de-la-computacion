from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes import router

app = FastAPI(
    title="Proyecto 3 - Simulador de Máquina de Turing",
    description="API para validar configuraciones YAML y simular Máquinas de Turing de una cinta.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "Proyecto 3 - Simulador de Máquina de Turing",
        "docs": "/docs",
        "health": "/health",
    }
if __name__ == "__main__" and __package__ is None:
    import sys
    from pathlib import Path

    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    __package__ = "app"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .routes import router

frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"

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
def root():
    index_file = frontend_dist / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    return {
        "name": "Proyecto 3 - Simulador de Máquina de Turing",
        "docs": "/docs",
        "health": "/health",
    }

if frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)

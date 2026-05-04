from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth
from routers import auth, preferences
from routers import auth, preferences, releases
from scheduler import start_scheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()  # inicia o scheduler quando o servidor sobe
    yield
    # código aqui roda quando o servidor desliga (opcional)

app = FastAPI(title="SHIFTO API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(releases.router)

@app.get("/")
def root():
    return {"message": "SHIFTO API rodando"}
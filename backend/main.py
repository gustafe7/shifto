from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import Base, engine
from routers import auth, preferences, releases
from scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # inicia o scheduler quando o servidor sobe
    start_scheduler()
    yield

app = FastAPI(title="SHIFTO API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# cria todas as tabelas no banco ao iniciar
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(releases.router)

@app.get("/")
def root():
    return {"message": "SHIFTO API rodando"}

# endpoint temporário para testar email — apagar depois
@app.get("/test-notification")
async def test_notification():
    from database import SessionLocal
    from models.user import User
    from services.email import send_release_notification
    
    db = SessionLocal()
    try:
        users = db.query(User).filter(
            User.is_active == True,
            User.email_notifications == True
        ).all()
        
        for user in users:
            await send_release_notification(str(user.email), [
                {
                    "title": "Elden Ring",
                    "category": "game",
                    "release_date": "2026-05-05",
                    "cover_url": "https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg",
                    "external_url": "https://rawg.io/games/elden-ring"
                },
                {
                    "title": "Mortal Kombat 2",
                    "category": "movie",
                    "release_date": "2026-05-06",
                    "cover_url": "https://image.tmdb.org/t/p/w500/jWOUkeXhlyDAmOm6RoznLVHKXRy.jpg",
                    "external_url": "https://www.themoviedb.org/movie/931285"
                },
                {
                    "title": "IT'S BEEN AWFUL — Isaiah Rashad",
                    "category": "album",
                    "release_date": "2026-04-30",
                    "cover_url": "https://cdn-images.dzcdn.net/images/cover/12df043ea6365cfa7320958abd27839d/250x250-000000-80-0-0.jpg",
                    "external_url": "https://www.deezer.com/album/961654201"
                }
            ])
        
        return {"message": f"Email enviado para {len(users)} usuário(s)"}
    finally:
        db.close()
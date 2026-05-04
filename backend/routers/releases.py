from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.preference import Preference
from services import rawg, tmdb, spotify
from routers.preferences import get_current_user_id

router = APIRouter(prefix="/releases", tags=["releases"])

@router.get("/")
async def get_releases(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    preferences = db.query(Preference).filter(Preference.user_id == user_id).all()

    game_genres = [str(p.value) for p in preferences if str(p.category) == "game"]
    has_movies = any(str(p.category) == "movie" for p in preferences)
    has_albums = any(str(p.category) == "album" for p in preferences)

    results = []

    if game_genres:
        games = await rawg.get_upcoming_games(list(game_genres))
        results.extend(games)

    if has_movies:
        movies = await tmdb.get_upcoming_movies([])
        results.extend(movies)

    if has_albums:
        albums = await spotify.get_new_releases()
        results.extend(albums)

    if not preferences:
        games = await rawg.get_upcoming_games(["action"])
        movies = await tmdb.get_upcoming_movies([])
        albums = await spotify.get_new_releases(5)
        results = games + movies + albums

    return {"releases": results, "total": len(results)}
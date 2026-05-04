from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.preference import Preference
from services import deezer, rawg, tmdb
from routers.preferences import get_current_user_id

router = APIRouter(prefix="/releases", tags=["releases"])


@router.get("/")
async def get_releases(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    preferences = db.query(Preference).filter(
        Preference.user_id == user_id).all()

    # separa as preferências por categoria
    game_genres = list(set([str(p.value)
                       for p in preferences if str(p.category) == "game"]))
    has_movies = any(str(p.category) == "movie" for p in preferences)
    has_albums = any(str(p.category) == "album" for p in preferences)

    results = []

    # busca jogos se o usuário tem preferências de jogos
    if game_genres:
        games = await rawg.get_upcoming_games(list(game_genres))
        results.extend(games)

    # busca filmes se o usuário tem preferências de filmes
    if has_movies:
        movies = await tmdb.get_upcoming_movies([])
        results.extend(movies)

    # busca álbuns se o usuário tem preferências de músicas
    if has_albums:
        album_genres = [str(p.value) for p in preferences if str(p.category) == "album"]
        albums = await deezer.get_new_releases(limit=30, genres=album_genres)
        results.extend(albums)

    # feed padrão para usuários sem preferências cadastradas
    if not preferences:
        games = await rawg.get_upcoming_games(["action"])
        movies = await tmdb.get_upcoming_movies([])
        albums = await deezer.get_new_releases(15, genres=["pop", "rock"])
        results = games + movies + albums

    # remove duplicatas pelo external_id + category
    seen = set()
    unique_results = []
    for item in results:
        key = f"{item['external_id']}-{item['category']}"
        if key not in seen:
            seen.add(key)
            unique_results.append(item)

    return {"releases": unique_results, "total": len(unique_results)}

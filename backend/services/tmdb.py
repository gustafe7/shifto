import httpx
from config import settings
from datetime import date, timedelta

BASE_URL = "https://api.themoviedb.org/3"

async def get_upcoming_movies(genres: list[str]) -> list[dict]:
    results = []

    # filmes dos últimos 90 dias + próximos lançamentos
    past = (date.today() - timedelta(days=90)).isoformat()
    future = (date.today() + timedelta(days=365)).isoformat()

    async with httpx.AsyncClient(timeout=30.0) as client:
        for page in range(1, 3):
            try:
                response = await client.get(f"{BASE_URL}/discover/movie", params={
                    "api_key": settings.TMDB_API_KEY,
                    "language": "pt-BR",
                    "sort_by": "popularity.desc",
                    "primary_release_date.gte": past,
                    "primary_release_date.lte": future,
                    "vote_count.gte": 10,
                    "without_genres": "99,10755",
                    "page": page
                })
                if response.status_code == 200:
                    for movie in response.json().get("results", []):
                        if not movie.get("poster_path"):
                            continue
                        results.append({
                            "external_id": str(movie["id"]),
                            "title": movie["title"],
                            "category": "movie",
                            "release_date": movie.get("release_date"),
                            "cover_url": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}",
                            # link direto para a página do filme na TMDB
                            "external_url": f"https://www.themoviedb.org/movie/{movie['id']}"
                        })
            except Exception as e:
                print(f"[TMDB] Erro na página {page}: {e}")
                continue

    return results
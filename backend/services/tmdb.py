import httpx
from config import settings

BASE_URL = "https://api.themoviedb.org/3"

async def get_upcoming_movies(genres: list[str]) -> list[dict]:
    results = []
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/movie/upcoming", params={
            "api_key": settings.TMDB_API_KEY,
            "language": "pt-BR"
        })
        if response.status_code == 200:
            data = response.json()
            for movie in data.get("results", []):
                results.append({
                    "external_id": str(movie["id"]),
                    "title": movie["title"],
                    "category": "movie",
                    "release_date": movie.get("release_date"),
                    "cover_url": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}"
                })
    return results
import httpx
from config import settings

BASE_URL = "https://api.rawg.io/api"

async def get_upcoming_games(genres: list[str]) -> list[dict]:
    results = []
    async with httpx.AsyncClient() as client:
        for genre in genres:
            response = await client.get(f"{BASE_URL}/games", params={
                "key": settings.RAWG_API_KEY,
                "genres": genre,
                "ordering": "-released",
                "page_size": 5
            })
            if response.status_code == 200:
                data = response.json()
                for game in data.get("results", []):
                    results.append({
                        "external_id": str(game["id"]),
                        "title": game["name"],
                        "category": "game",
                        "release_date": game.get("released"),
                        "cover_url": game.get("background_image")
                    })
    return results
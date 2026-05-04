import httpx
from config import settings
import base64

async def get_access_token() -> str:
    credentials = f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}"
    encoded = base64.b64encode(credentials.encode()).decode()
    async with httpx.AsyncClient() as client:
        response = await client.post("https://accounts.spotify.com/api/token",
            headers={"Authorization": f"Basic {encoded}"},
            data={"grant_type": "client_credentials"}
        )
        return response.json().get("access_token")

async def get_new_releases(limit: int = 10) -> list[dict]:
    token = await get_access_token()
    results = []
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.spotify.com/v1/browse/new-releases", 
            headers={"Authorization": f"Bearer {token}"},
            params={"limit": limit, "country": "BR"}
        )
        if response.status_code == 200:
            albums = response.json().get("albums", {}).get("items", [])
            for album in albums:
                results.append({
                    "external_id": album["id"],
                    "title": f"{album['name']} — {album['artists'][0]['name']}",
                    "category": "album",
                    "release_date": album.get("release_date"),
                    "cover_url": album["images"][0]["url"] if album["images"] else None
                })
    return results
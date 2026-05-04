import httpx
from config import settings
from datetime import date, timedelta

BASE_URL = "https://api.rawg.io/api"

# mapeamento dos gêneros em português para inglês
# a RAWG só aceita gêneros em inglês
GENRE_MAP = {
    "ação": "action",
    "rpg": "rpg",
    "aventura": "adventure",
    "estratégia": "strategy",
    "esportes": "sports",
    "terror": "horror",
    "indie": "indie"
}

async def get_upcoming_games(genres: list[str]) -> list[dict]:
    results = []

    # jogos dos últimos 8 anos + próximos lançamentos
    past = (date.today() - timedelta(days=2920)).isoformat()
    future = date(date.today().year + 1, 12, 31).isoformat()

    async with httpx.AsyncClient(timeout=30.0) as client:
        for genre in genres:
            # converte português para inglês antes de enviar para a RAWG
            genre_en = GENRE_MAP.get(genre.lower(), genre.lower())
            try:
                response = await client.get(f"{BASE_URL}/games", params={
                    "key": settings.RAWG_API_KEY,
                    "genres": genre_en,
                    "ordering": "-rating",        # mais bem avaliados primeiro
                    "dates": f"{past},{future}",  # últimos 8 anos + futuros
                    "page_size": 10,
                    "platforms": "4,187,186,18,1,7",  # PC, PS5, Xbox Series, PS4, Xbox One, Switch
                    "metacritic": "60,100"             # só jogos com boa avaliação
                })
                if response.status_code == 200:
                    data = response.json()
                    for game in data.get("results", []):
                        # ignora jogos sem imagem de capa
                        if not game.get("background_image"):
                            continue
                        results.append({
                            "external_id": str(game["id"]),
                            "title": game["name"],
                            "category": "game",
                            "release_date": game.get("released"),
                            "cover_url": game.get("background_image")
                        })
            except Exception as e:
                # se um gênero falhar, continua com os outros
                print(f"[RAWG] Erro no gênero {genre}: {e}")
                continue

    return results
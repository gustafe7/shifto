import httpx
from datetime import date, timedelta

# mapeamento dos gêneros em português para IDs fixos da API do Deezer
GENRE_MAP = {
    "pop": 132,
    "rock": 152,
    "hip-hop": 116,
    "eletrônico": 106,
    "jazz": 129,
    "clássico": 98,
    "r&b": 165,
    "funk": 169,
    "soul": 169,
    "country": 84,
    "reggae": 144,
    "metal": 464,
    "indie": 1153,
    "folk": 167
}

async def get_new_releases(limit: int = 30, genres: list[str] | None = None) -> list[dict]:
    results = []

    # álbuns dos últimos 90 dias
    cutoff_date = (date.today() - timedelta(days=90)).isoformat()

    # converte os gêneros do usuário para IDs do Deezer
    genre_ids = []
    if genres:
        for g in genres:
            genre_id = GENRE_MAP.get(g.lower())
            if genre_id:
                genre_ids.append(genre_id)

    # se nenhum gênero foi mapeado, usa pop e rock como padrão
    if not genre_ids:
        genre_ids = [132, 152]

    async with httpx.AsyncClient(timeout=30.0) as client:
        for genre_id in genre_ids[:5]:
            try:
                response = await client.get(
                    f"https://api.deezer.com/editorial/{genre_id}/releases",
                    params={"limit": 50}
                )
                if response.status_code == 200:
                    for album in response.json().get("data", []):
                        release_date = album.get("release_date", "")

                        # ignora álbuns mais antigos que 90 dias
                        if release_date and release_date < cutoff_date:
                            continue

                        # ignora álbuns sem capa
                        if not album.get("cover_medium"):
                            continue

                        # ignora itens sem artista
                        if not album.get("artist", {}).get("name"):
                            continue

                        results.append({
                            "external_id": str(album["id"]),
                            "title": f"{album['title']} — {album['artist']['name']}",
                            "category": "album",
                            "release_date": release_date,
                            "cover_url": album.get("cover_medium"),
                            "record_type": album.get("record_type", "album"),
                            # link direto para o álbum no Deezer
                            "external_url": f"https://www.deezer.com/album/{album['id']}"
                        })
            except Exception as e:
                print(f"[Deezer] Erro no gênero {genre_id}: {e}")
                continue

    return results
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from database import SessionLocal
from models.preference import Preference
from models.release import Release
import asyncio
from services import rawg, tmdb, spotify

# Função principal que busca e salva lançamentos novos
def fetch_and_save_releases():
    db: Session = SessionLocal()
    try:
        # Busca todas as preferências de todos os usuários
        preferences = db.query(Preference).all()

        # Separa gêneros de jogos únicos para não repetir buscas
        game_genres = list(set([str(p.value) for p in preferences if str(p.category) == "game"]))
        has_movies = any(str(p.category) == "movie" for p in preferences)
        has_albums = any(str(p.category) == "album" for p in preferences)

        results = []

        # Roda as funções async dentro de um loop síncrono
        # O APScheduler roda em thread síncrona, por isso precisamos do asyncio.run()
        if game_genres:
            games = asyncio.run(rawg.get_upcoming_games(game_genres))
            results.extend(games)

        if has_movies:
            movies = asyncio.run(tmdb.get_upcoming_movies([]))
            results.extend(movies)

        if has_albums:
            albums = asyncio.run(spotify.get_new_releases())
            results.extend(albums)

        # Salva apenas lançamentos que ainda não existem no banco
        # Usa external_id + category como chave única para evitar duplicatas
        for item in results:
            exists = db.query(Release).filter(
                Release.external_id == item["external_id"],
                Release.category == item["category"]
            ).first()

            if not exists:
                release = Release(
                    external_id=item["external_id"],
                    title=item["title"],
                    category=item["category"],
                    release_date=item.get("release_date"),
                    cover_url=item.get("cover_url")
                )
                db.add(release)

        db.commit()
        print(f"[Scheduler] {len(results)} lançamentos verificados")

    except Exception as e:
        print(f"[Scheduler] Erro: {e}")
    finally:
        # Sempre fecha a sessão, mesmo se der erro
        db.close()

# Cria e configura o scheduler
scheduler = BackgroundScheduler()

# Roda todo dia às 8h da manhã
scheduler.add_job(
    fetch_and_save_releases,
    CronTrigger(hour=8, minute=0),
    id="daily_releases",
    replace_existing=True
)

def start_scheduler():
    scheduler.start()
    print("[Scheduler] Iniciado — verificando lançamentos todo dia às 8h")
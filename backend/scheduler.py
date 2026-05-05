from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from database import SessionLocal
from models.preference import Preference
from models.release import Release
from models.user import User
from models.notification import NotificationSent
import asyncio
from services import deezer, rawg, tmdb
from services.email import send_release_notification


def fetch_and_save_releases():
    db: Session = SessionLocal()
    try:
        # busca todos os usuários ativos que aceitam notificações por email
        users = db.query(User).filter(
            User.is_active == True,
            User.email_notifications == True
        ).all()

        print(f"[Scheduler] {len(users)} usuários para notificar")

        for user in users:
            # busca as preferências individuais de cada usuário
            preferences = db.query(Preference).filter(
                Preference.user_id == user.id
            ).all()

            # separa gêneros por categoria
            game_genres = list(set([str(p.value) for p in preferences if str(p.category) == "game"]))
            has_movies = any(str(p.category) == "movie" for p in preferences)
            has_albums = any(str(p.category) == "album" for p in preferences)

            results = []

            # APScheduler roda em thread síncrona — asyncio.run() converte as chamadas async
            if game_genres:
                games = asyncio.run(rawg.get_upcoming_games(game_genres))
                results.extend(games)

            if has_movies:
                movies = asyncio.run(tmdb.get_upcoming_movies([]))
                results.extend(movies)

            if has_albums:
                album_genres = [str(p.value) for p in preferences if str(p.category) == "album"]
                albums = asyncio.run(deezer.get_new_releases(limit=10, genres=album_genres))
                results.extend(albums)

            # filtra só lançamentos que ainda NÃO foram notificados para esse usuário
            new_releases = []
            for item in results:
                # verifica se esse lançamento já foi notificado para esse usuário
                already_notified = db.query(NotificationSent).filter(
                    NotificationSent.user_id == user.id,
                    NotificationSent.external_id == item["external_id"],
                    NotificationSent.category == item["category"]
                ).first()

                if not already_notified:
                    new_releases.append(item)

                    # salva no banco que esse lançamento foi notificado
                    notification = NotificationSent(
                        user_id=user.id,
                        external_id=item["external_id"],
                        category=item["category"]
                    )
                    db.add(notification)

                    # salva também na tabela de releases se ainda não existir
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

            # envia email só se houver lançamentos novos para esse usuário
            if new_releases:
                asyncio.run(send_release_notification(str(user.email), new_releases))
                print(f"[Scheduler] Email enviado para {user.email} com {len(new_releases)} novidades")
            else:
                print(f"[Scheduler] Sem novidades para {user.email}")

    except Exception as e:
        print(f"[Scheduler] Erro: {e}")
    finally:
        # sempre fecha a sessão, mesmo se der erro
        db.close()


# cria e configura o scheduler
scheduler = BackgroundScheduler()

# roda todo dia às 8h da manhã
scheduler.add_job(
    fetch_and_save_releases,
    CronTrigger(hour=8, minute=0),
    id="daily_releases",
    replace_existing=True
)

def start_scheduler():
    scheduler.start()
    print("[Scheduler] Iniciado — verificando lançamentos todo dia às 8h")
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings


def pick_one_per_category(releases: list[dict]) -> list[dict]:
    """Seleciona um lançamento de cada categoria para o email."""
    picked = {}
    for r in releases:
        cat = r.get("category")
        # pega o primeiro de cada categoria que encontrar
        if cat not in picked:
            picked[cat] = r
    return list(picked.values())


def build_item_html(r: dict) -> str:
    """Monta o HTML de um card de lançamento."""
    cover = ""
    if r.get("cover_url"):
        cover = f'<img src="{r["cover_url"]}" width="72" height="72" style="border-radius:8px;object-fit:cover;flex-shrink:0;" />'

    category_color = {
        "game": "#1DB954",
        "movie": "#1877F2",
        "album": "#E91E8C"
    }.get(r.get("category", ""), "#555")

    category_label = {
        "game": "🎮 Jogo",
        "movie": "🎬 Filme",
        "album": "🎵 Música"
    }.get(r.get("category", ""), "")

    url = r.get("external_url", "#")
    date_html = f'<p style="margin:4px 0 0;font-size:11px;color:#666;">📅 {r.get("release_date", "")}</p>' if r.get("release_date") else ""

    return f"""
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #1a1a2e;">
        <a href="{url}" style="display:flex;align-items:center;gap:14px;text-decoration:none;color:inherit;">
          {cover}
          <div>
            <span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
              padding:2px 8px;border-radius:20px;color:#fff;background:{category_color};margin-bottom:6px;">
              {category_label}
            </span>
            <p style="margin:0;font-size:14px;font-weight:600;color:#fff;line-height:1.3;">{r["title"]}</p>
            {date_html}
          </div>
        </a>
      </td>
    </tr>
    """


async def send_release_notification(to_email: str, releases: list[dict]):
    # não envia se não houver lançamentos
    if not releases:
        return

    # seleciona um lançamento de cada categoria
    selected = pick_one_per_category(releases)

    # monta os cards HTML
    items_html = "".join([build_item_html(r) for r in selected])

    # quantas categorias foram incluídas
    categories = [r.get("category") for r in selected]
    has_game = "game" in categories
    has_movie = "movie" in categories
    has_album = "album" in categories

    # monta o subtítulo dinâmico baseado nas categorias disponíveis
    parts = []
    if has_game: parts.append("jogos")
    if has_movie: parts.append("filmes")
    if has_album: parts.append("músicas")
    subtitle = " · ".join(parts).capitalize() + " em destaque hoje"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="background:#080810;font-family:'Helvetica Neue',Arial,sans-serif;padding:0;margin:0;">
      <div style="max-width:480px;margin:0 auto;padding:32px 24px;">

        <!-- header -->
        <div style="margin-bottom:24px;">
          <h1 style="font-size:32px;letter-spacing:6px;color:#2563eb;margin:0 0 4px;font-weight:900;">SHIFTO</h1>
          <p style="color:#666;font-size:13px;margin:0;">{subtitle}</p>
        </div>

        <!-- divider -->
        <div style="height:1px;background:linear-gradient(90deg,#2563eb,transparent);margin-bottom:24px;"></div>

        <!-- cards -->
        <table width="100%" cellpadding="0" cellspacing="0">
          {items_html}
        </table>

        <!-- cta -->
        <div style="text-align:center;margin-top:28px;">
          <a href="http://localhost:5173/feed"
            style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
            padding:12px 28px;border-radius:20px;font-size:13px;font-weight:700;letter-spacing:0.5px;">
            Ver feed completo →
          </a>
        </div>

        <!-- footer -->
        <p style="color:#333;font-size:11px;margin-top:28px;text-align:center;line-height:1.6;">
          Você recebe este email porque tem uma conta no SHIFTO.<br>
          Para cancelar, acesse suas preferências no app.
        </p>

      </div>
    </body>
    </html>
    """

    # monta a mensagem com título personalizado
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "🎮🎬🎵 Novidades no SHIFTO — confira os destaques de hoje"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    # envia via Gmail SMTP com TLS
    await aiosmtplib.send(
        msg,
        hostname=settings.EMAIL_HOST,
        port=settings.EMAIL_PORT,
        username=settings.EMAIL_USER,
        password=settings.EMAIL_PASSWORD,
        start_tls=True
    )
    print(f"[Email] Notificação enviada para {to_email}")
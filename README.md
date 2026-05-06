# SHIFTO

Feed personalizado de lançamentos de jogos, filmes e músicas.

🔗 [shifto-eight.vercel.app](https://shifto-eight.vercel.app)

## O que é

Você escolhe seus gêneros favoritos e o SHIFTO monta um feed com lançamentos recentes e futuros. Opcionalmente, receba um email todo dia às 8h com um destaque de cada categoria — sem repetir o que já foi enviado.

## Funcionalidades

- Autenticação com JWT
- Feed personalizado por preferências de gênero
- Filtro por categoria com hero section clicável
- Cards linkados para RAWG, TMDB e Deezer
- Notificações por email com scheduler diário
- Controle de duplicatas por usuário
- Layout responsivo — mobile first

## Tecnologias

### Backend
- Python 3.12
- FastAPI
- PostgreSQL + SQLAlchemy
- JWT (autenticação)
- APScheduler (tarefas agendadas)
- HTTPX (requisições HTTP)
- aiosmtplib (envio de email via Gmail SMTP)

### Frontend
- React + Vite
- React Router DOM
- Axios
- Font Awesome (ícones)

### APIs externas
- [RAWG](https://rawg.io/apidocs) — jogos
- [TMDB](https://www.themoviedb.org/documentation/api) — filmes
- [Deezer](https://developers.deezer.com) — músicas

### Infraestrutura
- Backend: [Render](https://render.com)
- Banco de dados: [Supabase](https://supabase.com) (PostgreSQL)
- Frontend: [Vercel](https://vercel.com)

## Rodando localmente

```bash
# backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

Crie um `.env` na pasta `backend/` com base no `.env.example`.

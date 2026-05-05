# SHIFTO — Jogos, Filmes e Músicas

Feed personalizado de lançamentos de jogos, filmes e músicas.

## Funcionalidades

- Cadastro e login com autenticação JWT
- Feed personalizado com base nas preferências do usuário
- Filtro por categoria: jogos, filmes e músicas
- Hero section clicável com destaque para o lançamento principal
- Cards clicáveis que redirecionam para RAWG, TMDB e Deezer
- Preferências por gênero — ação, RPG, pop, rock, drama, etc.
- Lançamentos filtrados por data e plataforma (PC, PS5, Xbox, Switch)
- Notificações por email com um destaque de cada categoria (jogo, filme e música)
- Toggle para ativar/desativar notificações por email nas preferências
- Scheduler automático que verifica novos lançamentos todo dia às 8h
- Controle de duplicatas — não notifica o mesmo lançamento duas vezes
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

## Como rodar

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Crie um `.env` baseado no `.env.example` com suas chaves de API e dados do banco.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from models.preference import Preference
from config import settings
from models.user import User

router = APIRouter(prefix="/preferences", tags=["preferences"])
security = HTTPBearer()

class NotificationRequest(BaseModel):
    email_notifications: bool

class PreferenceRequest(BaseModel):
    category: str  # game, movie, series, album
    value: str     # ex: "RPG", "Action", "Rock"

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

@router.post("/", status_code=201)
def add_preference(data: PreferenceRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    preference = Preference(user_id=user_id, category=data.category, value=data.value)
    db.add(preference)
    db.commit()
    return {"message": "Preferência salva"}

@router.get("/")
def list_preferences(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    return db.query(Preference).filter(Preference.user_id == user_id).all()

@router.delete("/{preference_id}")
def delete_preference(preference_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    pref = db.query(Preference).filter(Preference.id == preference_id, Preference.user_id == user_id).first()
    if not pref:
        raise HTTPException(status_code=404, detail="Preferência não encontrada")
    db.delete(pref)
    db.commit()
    return {"message": "Preferência removida"}

@router.put("/notifications")
def update_notifications(data: NotificationRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    # busca o usuário pelo ID do token
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    # setattr evita o aviso do Pylance com colunas SQLAlchemy
    setattr(user, 'email_notifications', data.email_notifications)
    db.commit()
    return {"message": "Preferência de notificação atualizada"}

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    # retorna as configurações do usuário logado
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"email_notifications": user.email_notifications}
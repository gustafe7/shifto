from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from models.preference import Preference
from config import settings

router = APIRouter(prefix="/preferences", tags=["preferences"])
security = HTTPBearer()

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
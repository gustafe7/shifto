from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class NotificationSent(Base):
    __tablename__ = "notifications_sent"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # usuário que recebeu a notificação
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    # ID externo do lançamento (ex: ID do jogo na RAWG)
    external_id = Column(String, nullable=False)
    # categoria do lançamento (game, movie, album)
    category = Column(String, nullable=False)
    # quando foi notificado
    notified_at = Column(DateTime(timezone=True), server_default=func.now())
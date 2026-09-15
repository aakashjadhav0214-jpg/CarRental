import uuid
from sqlalchemy import Column, String, Float
from ..database import Base

class Office(Base):
    __tablename__ = "office"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String, nullable=False)
    working_hours = Column(String, nullable=False)

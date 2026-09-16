from pydantic import BaseModel

class OfficeBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    phone: str
    working_hours: str

class OfficeUpdate(OfficeBase):
    pass

class OfficeResponse(OfficeBase):
    id: str

    class Config:
        from_attributes = True

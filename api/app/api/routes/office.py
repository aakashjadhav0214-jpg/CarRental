from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import deps
from ...models.office import Office
from ...schemas.office import OfficeUpdate, OfficeResponse

router = APIRouter()

def get_or_create_office(db: Session) -> Office:
    office = db.query(Office).first()
    if not office:
        office = Office(
            name="Shri Krishna Car & Bike Rentals - Hassan Hub",
            address="232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan, Karnataka - 573201",
            latitude=13.001567,
            longitude=76.081876,
            phone="+91 72598 57486 | +91 95133 48666",
            working_hours="06:00 AM - 11:00 PM"
        )
        db.add(office)
        db.commit()
        db.refresh(office)
    else:
        # Ensure latest location details are updated
        office.address = "232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan, Karnataka - 573201"
        office.latitude = 13.001567
        office.longitude = 76.081876
        office.phone = "+91 72598 57486 | +91 95133 48666"
        db.commit()
        db.refresh(office)
    return office

@router.get("/", response_model=OfficeResponse)
def get_office(db: Session = Depends(deps.get_db)):
    return get_or_create_office(db)

@router.put("/admin", response_model=OfficeResponse)
def update_office(
    office_in: OfficeUpdate,
    db: Session = Depends(deps.get_db),
    current_admin = Depends(deps.get_current_admin_user)
):
    office = get_or_create_office(db)
    
    for field, value in office_in.model_dump().items():
        setattr(office, field, value)
        
    db.commit()
    db.refresh(office)
    return office

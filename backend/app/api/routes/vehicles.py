from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import deps
from ...models.vehicle import Vehicle
from ...schemas.vehicle import VehicleResponse

router = APIRouter()

@router.get("", response_model=List[VehicleResponse])
@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(
    category: Optional[str] = None,
    status: Optional[str] = "AVAILABLE",
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(deps.get_db)
):
    try:
        query = db.query(Vehicle)
        
        if category:
            query = query.filter(Vehicle.category == category)
        if status:
            query = query.filter(Vehicle.status == status)
            
        vehicles = query.offset(skip).limit(limit).all()
        return vehicles
    except Exception as e:
        print("Error fetching vehicles:", e)
        return []

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: str, db: Session = Depends(deps.get_db)):
    try:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return vehicle
    except HTTPException:
        raise
    except Exception as e:
        print("Error fetching vehicle details:", e)
        raise HTTPException(status_code=404, detail="Vehicle not found")

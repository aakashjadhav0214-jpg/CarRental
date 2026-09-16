from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import uuid
from .. import deps
from ...models.vehicle import Vehicle, VehicleImage
from ...schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse

router = APIRouter()

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_admin = Depends(deps.get_current_admin_user)):
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/uploads/{filename}"}

@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(deps.get_db),
    current_admin = Depends(deps.get_current_admin_user)
):
    # Check if registration number exists
    existing = db.query(Vehicle).filter(Vehicle.registration_number == vehicle_in.registration_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")
    
    # Create Vehicle
    db_vehicle = Vehicle(
        category=vehicle_in.category,
        brand=vehicle_in.brand,
        model=vehicle_in.model,
        registration_number=vehicle_in.registration_number,
        year=vehicle_in.year,
        fuel_type=vehicle_in.fuel_type,
        transmission=vehicle_in.transmission,
        engine_capacity=vehicle_in.engine_capacity,
        seats=vehicle_in.seats,
        description=vehicle_in.description,
        features=vehicle_in.features,
        hourly_price=vehicle_in.hourly_price,
        daily_price=vehicle_in.daily_price,
        security_deposit=vehicle_in.security_deposit,
        status=vehicle_in.status
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    # Add Images if provided
    if vehicle_in.images:
        for img in vehicle_in.images:
            db_img = VehicleImage(
                vehicle_id=db_vehicle.id,
                image_url=img.image_url,
                is_primary=img.is_primary
            )
            db.add(db_img)
        db.commit()
        db.refresh(db_vehicle)

    return db_vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(deps.get_db),
    current_admin = Depends(deps.get_current_admin_user)
):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = vehicle_in.model_dump(exclude_unset=True)
    images_data = update_data.pop("images", None)
    
    # Update simple fields
    for field, value in update_data.items():
        setattr(db_vehicle, field, value)
        
    # Update images (replace all)
    if images_data is not None:
        db.query(VehicleImage).filter(VehicleImage.vehicle_id == vehicle_id).delete()
        for img in images_data:
            db_img = VehicleImage(
                vehicle_id=vehicle_id,
                image_url=img["image_url"],
                is_primary=img["is_primary"]
            )
            db.add(db_img)
            
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(deps.get_db),
    current_admin = Depends(deps.get_current_admin_user)
):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Soft delete
    db_vehicle.status = "INACTIVE"
    db.commit()
    return None

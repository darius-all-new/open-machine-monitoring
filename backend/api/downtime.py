'''
OpenMachineMonitoring

This file is part of OpenMachineMonitoring.

OpenMachineMonitoring is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

OpenMachineMonitoring is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with OpenMachineMonitoring. If not, see <https://www.gnu.org/licenses/>
'''

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from utility_functions import get_db
import crud, schemas

router = APIRouter()

@router.get("/get-downtimes", tags=["Downtime"], response_model=List[schemas.Downtime])
def get_downtimes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    '''
    Returns a list of all downtime records
    '''
    downtimes = crud.get_downtimes(db, skip=skip, limit=limit)
    return downtimes

@router.get("/get-downtime/{downtime_id}", tags=["Downtime"], response_model=schemas.Downtime)
def get_downtime(downtime_id: int, db: Session = Depends(get_db)):
    '''
    Returns one downtime record corresponding to the given downtime id number
    '''
    downtime = crud.get_downtime(db, downtime_id=downtime_id)
    if downtime is None:
        raise HTTPException(status_code=404, detail="Downtime record not found")
    return downtime

@router.get("/get-downtimes-by-asset/{asset_id}", tags=["Downtime"], response_model=List[schemas.Downtime])
def get_downtimes_by_asset(asset_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    '''
    Returns all downtime records for a specific asset
    '''
    asset = crud.get_asset(db, asset_id=asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    downtimes = crud.get_downtimes_by_asset(db, asset_id=asset_id, skip=skip, limit=limit)
    return downtimes

@router.post("/create-downtime", tags=["Downtime"], response_model=schemas.Downtime)
def create_downtime(downtime: schemas.DowntimeCreate, db: Session = Depends(get_db)):
    '''
    Create a new downtime record
    '''
    # Check if the asset exists
    asset = crud.get_asset(db, asset_id=downtime.asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return crud.create_downtime(db=db, downtime=downtime)

@router.put("/update-downtime/{downtime_id}", tags=["Downtime"], response_model=schemas.Downtime)
def update_downtime(downtime_id: int, downtime: schemas.DowntimeUpdate, db: Session = Depends(get_db)):
    '''
    Update an existing downtime record
    '''
    updated_downtime = crud.update_downtime(db=db, downtime_id=downtime_id, downtime=downtime)
    if updated_downtime is None:
        raise HTTPException(status_code=404, detail="Downtime record not found")
    
    return updated_downtime

@router.delete("/delete-downtime/{downtime_id}", tags=["Downtime"], response_model=dict)
def delete_downtime(downtime_id: int, db: Session = Depends(get_db)):
    '''
    Delete a downtime record
    '''
    success = crud.delete_downtime(db=db, downtime_id=downtime_id)
    if not success:
        raise HTTPException(status_code=404, detail="Downtime record not found")
    
    return {"message": "Downtime record deleted successfully"}

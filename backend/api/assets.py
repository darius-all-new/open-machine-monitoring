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

import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from influxdb_functions import get_timestamps_for_yesterday, get_data_over_time_period
from utility_functions import calculate_duration, update_latest_status, get_db
import crud, schemas

router = APIRouter()

@router.get("/get-assets", tags=["Assets"], response_model=List[schemas.Asset])
def get_assets(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    '''
    Returns a list of all assets connected to the system
    '''
    assets = crud.get_assets(db, skip=skip, limit=limit)
    return assets

@router.get("/get-assets/{asset_id}", tags=["Assets"], response_model=schemas.Asset)
def get_asset(asset_id: int, db: Session=Depends(get_db)):
    '''
    Returns one asset corresponding to the given asset id number
    '''
    asset = crud.get_asset(db, asset_id=asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/create-asset", tags=["Assets"], response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session=Depends(get_db)):
    
    return crud.create_asset(db=db, asset=asset)

@router.put("/update-asset", tags=["Assets"], response_model=schemas.Asset)
async def update_asset(asset_id: int, updated_asset: schemas.AssetUpdate, db: Session=Depends(get_db)):

    return (crud.update_asset(asset_id=asset_id, db=db, asset=updated_asset))

@router.post("/create-usage-record", tags=["Assets"], response_model=schemas.UsageRecord)
def create_usage_record(asset_id: int, db: Session=Depends(get_db)):
    '''
    Add a new usage record to the specified asset. A usage record contains information on how long the asset had each status (on/off/idle)
    '''
    asset = crud.get_asset(db=db, asset_id=asset_id)
    start_time_yesterday, end_time_yesterday = get_timestamps_for_yesterday()

    yesterday_data = get_data_over_time_period(asset.topic, start_time_yesterday, end_time_yesterday)

    usage_data = calculate_duration(yesterday_data)

    current_datetime = datetime.datetime.now()
    yesterday_datetime = current_datetime - datetime.timedelta(days=1)

    usage_data["date"] = yesterday_datetime

    return crud.create_usage_record(db=db, asset_id=asset_id, usage_record=usage_data)

@router.get("/usage-records-for-asset", tags=["Assets"], response_model=List[schemas.UsageRecord])
def get_usage_records_for_asset(asset_id: int, days: int, db: Session=Depends(get_db)):
    return crud.get_usage_records_for_asset(db=db, asset_id=asset_id, days=days)

@router.get("/usage-records-for-all-assets", tags=["Assets"], response_model=List[schemas.UsageRecord])
def get_usage_records_for_all_assets(days: int, db: Session=Depends(get_db)):
    return crud.get_usage_records_for_all_assets(db=db, days=days)

@router.get("/update-asset-statuses", tags=["Assets"], response_model=dict)
async def start_updating_statuses(background_tasks: BackgroundTasks, db: Session=Depends(get_db)):
    '''
    This updates the latest status of the machine (on, off or idle)
    '''
    all_assets = crud.get_assets(db)
    background_tasks.add_task(update_latest_status, all_assets, db)
    return({"message": "Started status update for all assets"})

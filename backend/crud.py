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

from sqlalchemy.orm import Session
from sqlalchemy import func

import models, schemas

from datetime import datetime, timedelta

TIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"

def get_asset(db: Session, asset_id: int):
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()

def get_assets(db: Session, skip: int = 0, limit: int = 100):
    assets = db.query(models.Asset).offset(skip).limit(limit).all()
    
    return assets

def create_asset(db: Session, asset: schemas.AssetCreate):
    db_asset = models.Asset(**asset.dict(), status="unknown", usage_data={}, usage_records=[])
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    
    return db_asset

def update_asset(asset_id: int, db: Session, asset: schemas.AssetUpdate):
    existing_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()

    if existing_asset is None:
        return {"message": "Asset not found"}
    
    for f, v in asset.__dict__.items():
         if f != "id" and v is not None:
             setattr(existing_asset, f, v)

    db.commit()
    db.refresh(existing_asset)

    return existing_asset
    
def create_usage_record(db: Session, asset_id: int, usage_record: schemas.UsageRecordCreate):
    # current_time = datetime.now()
    # current_time_formatted = current_time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    # asset_id = asset.id

    db_usage_record = models.UsageRecord(**usage_record, asset_id=asset_id)
    db.add(db_usage_record)
    db.commit()
    db.refresh(db_usage_record)
    return db_usage_record

def get_usage_records_for_asset(db: Session, asset_id: int, days: int):
    current_date = datetime.now().date()
    start_date = current_date - timedelta(days=days)

    return db.query(models.UsageRecord).filter(models.UsageRecord.asset_id == asset_id, func.date(models.UsageRecord.date) >= start_date,
        func.date(models.UsageRecord.date) <= current_date).all()

def get_usage_records_for_all_assets(db: Session, days: int):
    current_date = datetime.now().date()
    start_date = current_date - timedelta(days=days)

    return db.query(models.UsageRecord).filter(func.date(models.UsageRecord.date) >= start_date,
        func.date(models.UsageRecord.date) <= current_date).all()


def get_settings(db: Session, settings_id: int):
    return db.query(models.Settings).filter(models.Settings.id == 1).first()

def change_settings(db: Session, id: int, settings: schemas.SettingsUpdate):
    existing_settings = db.query(models.Settings).filter(models.Settings.id == 1).first()
    if existing_settings is None:
        return {"message": "Settings not found"}
    
    for f, v in settings.__dict__.items():
        if f != "id" and v is not None:
            setattr(existing_settings, f, v)

    db.commit()
    db.refresh(existing_settings)

    return existing_settings

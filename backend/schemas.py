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

from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

'''
Asset
manufacturer, model, topic
status
time_of_last_status
uptime
idletime
downtime
⬆️ ... 24 hours, week, month
'''


class UsageRecordBase(BaseModel):
    time_on: float
    time_off: float
    time_idle: float
    date: datetime  

class UsageRecordCreate(UsageRecordBase):
    pass

class UsageRecordUpdate(BaseModel):
    time_on: Optional[float]
    time_off: Optional[float]
    time_idle: Optional[float]
    date: Optional[datetime]

class UsageRecord(UsageRecordBase):
    id: int
    asset_id: int

    class Config:
        orm_mode = True

class Data(BaseModel):
    time: str
    topic: str
    current: float

class AssetBase(BaseModel):
    manufacturer: str
    model: str
    topic: str

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    manufacturer: Optional[str]
    model: Optional[str]
    topic: Optional[str]
    status: Optional[str]
    usage_data: Optional[Dict[str, float]]

class Asset(AssetBase):
    id: int
    status: str
    usage_data: Dict[str, float] = {}

    class Config:
        orm_mode = True

'''
SETTINGS
'''

class Settings(BaseModel):
    id: int
    day_duration: float
    week_start: str

class SettingsUpdate(BaseModel):
    day_duration: Optional[float]
    week_start: Optional[str]

'''
USERS
'''

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class Query(BaseModel):
    id: int
    time: int # number of minutes to look back

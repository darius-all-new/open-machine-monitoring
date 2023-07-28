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

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List

from influxdb_functions import get_data_over_time_period
from utility_functions import get_db
import crud, schemas

router = APIRouter()

@router.post("/data/period", tags=["Data"], response_model=List[schemas.Data])
def asset_data_period(asset_id: int, time_from: str, time_to: str, db: Session=Depends(get_db)):
    '''
    Retrieves data for an asset over a given time period
    '''

    asset_info = crud.get_asset(db, asset_id=asset_id)
    topic_of_interest = asset_info.topic
    data = get_data_over_time_period(topic_of_interest, time_from, time_to)

    return data

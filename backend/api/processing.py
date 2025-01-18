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

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from utility_functions import calculate_day_metrics, get_db
import crud

router = APIRouter()

@router.get("/calculate/day-metrics", tags=["Processing"], response_model=dict)
async def start_calculating_day_metrics(background_tasks: BackgroundTasks, db: Session=Depends(get_db)):
    '''
    This calculates the uptime/downtime and idle time for the day so far for each asset and updates those metrics in the database.
    '''
    all_assets = crud.get_assets(db)
    background_tasks.add_task(calculate_day_metrics, all_assets)
    return({"message": "Started calculation for the current day"})

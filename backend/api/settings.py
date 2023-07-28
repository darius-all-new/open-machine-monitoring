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
from sqlalchemy.orm import Session

from utility_functions import get_db
import crud, schemas

router = APIRouter()

# TODO: Error handling for Settings endpoints.

@router.get("/settings", tags=["Settings"], response_model=schemas.Settings)
def get_settings(id: int=1, db: Session=Depends(get_db)):
    settings = crud.get_settings(db, id)
    
    return schemas.Settings(**settings.__dict__)

@router.put("/update-settings", tags=["Settings"], response_model=schemas.Settings)
async def update_settings(settings_id: int, updated_settings: schemas.SettingsUpdate, db: Session=Depends(get_db)):
    new_settings = crud.change_settings(db=db, id=settings_id, settings=updated_settings)

    return schemas.Settings(**new_settings.__dict__)

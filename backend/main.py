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

import toml
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from api import settings, assets, data, processing
import models

# Load config parameters from config.toml
config_params = toml.load("config.toml")

# Setup db tables 
models.Base.metadata.create_all(bind=engine)

# Description used for API docs
description = '''
OpenMachineMonitoring API 🤖

An open source tool for monitoring industrial assets
'''

# FastAPI app definition
app = FastAPI(
    title="OpenMachineMonitoring",
    description=description,
    version=config_params["api_version"],
    contact={
        "name": "Darius Foster",
        "url": "https://www.allnewconsulting.com",
        "email": "darius@allnewconsulting.com"
    }
)

# CORS: give access to the frontend
origins = [
    "http://localhost:5173" # OMM Frontend (local)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API endpoints
app.include_router(settings.router)
app.include_router(assets.router)
app.include_router(data.router)
app.include_router(processing.router)

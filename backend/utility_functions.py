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
import datetime

from database import SessionLocal
from influxdb_functions import getlatestdata, get_data_over_time_period, get_formatted_timestamps
import crud, schemas

config_params = toml.load("config.toml")

TIME_FORMAT = config_params["TIME_FORMAT"]

# SQLite Database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def calculate_status(current):
    '''
    Return the machine status (on, idle or off) based on the measured electrical current.
    
    TODO: user-controlled status boundaries
    TODO: different boundaries for different machines
    '''

    if current < config_params["current"]["OFF"]:
        return "off"
    elif config_params["current"]["OFF"] <= current < config_params["current"]["ON"]:
        return "idle"
    elif current >= config_params["current"]["ON"]:
        return "on"

def calculate_duration(data):
    '''
    Return a dictionary containing the amount of time the machine was on/idle/off for the given data.
    '''

    total_duration = datetime.timedelta()
    off_duration = datetime.timedelta()
    idle_duration = datetime.timedelta()
    on_duration = datetime.timedelta()

    for i in range(1, len(data)):
        current_time = datetime.datetime.strptime(data[i]["time"], "%Y-%m-%dT%H:%M:%S.%f%z")
        prev_time = datetime.datetime.strptime(data[i-1]["time"], "%Y-%m-%dT%H:%M:%S.%f%z")
        duration = current_time - prev_time
        total_duration += duration

        # Check if there is a significant time gap between consecutive readings. If there was, assume that period was downtime.
        if duration > datetime.timedelta(minutes=5):
            off_duration += duration
            continue

        if data[i-1]["current"] < config_params["current"]["OFF"]:
            off_duration += duration
        elif config_params["current"]["OFF"] <= data[i-1]["current"] < config_params["current"]["ON"]:
            idle_duration += duration
        elif data[i-1]["current"] >= config_params["current"]["ON"]:
            on_duration += duration

    print(f"{off_duration.total_seconds()}, {idle_duration.total_seconds()}, {on_duration.total_seconds()}")

    return {
        # "total_duration": total_duration.total_seconds(),
        "time_off": off_duration.total_seconds(),
        "time_idle": idle_duration.total_seconds(),
        "time_on": on_duration.total_seconds()
    }

def calculate_day_metrics(list_of_assets, db):
    '''
    Update assets with their usage data for the current day
    '''

    for asset in list_of_assets:
        start_time, end_time = get_formatted_timestamps("day")
        
        todays_data_so_far = get_data_over_time_period(asset.topic, start_time=start_time, end_time=end_time)
        
        durations = {"usage_data": calculate_duration(todays_data_so_far)}
        
        asset_update = schemas.AssetUpdate(**durations)
        
        updated_asset = crud.update_asset(asset_id=asset.id, db=db, asset=asset_update)
        
def update_latest_status(list_of_assets, db):
    '''
    Update each asset with the latest status (on/off/idle)
    '''

    for asset in list_of_assets:
        latest_data = getlatestdata(asset.topic)
        
        if (len(latest_data) > 0):
            print(latest_data[0])
            update_data = {"status": calculate_status(latest_data[0]["current"])}
            update_data = schemas.AssetUpdate(**update_data)
            updated_asset = crud.update_asset(asset_id=asset.id, db=db, asset=update_data)

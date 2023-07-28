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
from influxdb_client import InfluxDBClient
import certifi
import json
from datetime import datetime, timedelta

config_params = toml.load("config.toml")

TIME_FORMAT = config_params["TIME_FORMAT"]

TOKEN = config_params["influxdb"]["TOKEN"]
bucket = config_params["influxdb"]["bucket"]
URL = config_params["influxdb"]["URL"]
ORG = config_params["influxdb"]["ORG"]

def get_timestamps_for_yesterday():
    '''
    Returns two timestamps, in the correct format, covering the day before the current day.
    '''

    # Get the current datetime
    current_datetime = datetime.now()

    # Calculate yesterday's date
    yesterday_date = current_datetime.date() - timedelta(days=1)

    # Start of yesterday (00:00:00)
    start_of_yesterday = datetime.combine(yesterday_date, datetime.min.time())

    # End of yesterday (23:59:59)
    end_of_yesterday = datetime.combine(yesterday_date, datetime.max.time())

    # Format timestamps in the desired format
    start_formatted = start_of_yesterday.strftime(TIME_FORMAT)
    end_formatted = end_of_yesterday.strftime(TIME_FORMAT)

    return start_formatted, end_formatted

def get_formatted_timestamps(time_range):
    '''
    Returns two timestamps, in the correct format, covering the current day, week or month up to the current time.

    time_range must be one of "day", "week" or "month"
    '''
    print(TIME_FORMAT)
    
    current_time = datetime.now()
    current_time_formatted = current_time.strftime(TIME_FORMAT)

    if time_range == "day":
        start_time = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
    elif time_range == "week":
        start_time = current_time - timedelta(days=current_time.weekday())
        start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    elif time_range == "month":
        start_time = current_time.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        raise ValueError("Invalid time range. Please choose 'day', 'week', or 'month'.")

    start_time_formatted = start_time.strftime(TIME_FORMAT)

    return start_time_formatted, current_time_formatted

def query_influx(query):
    '''
    Function for querying InfluxDB
    '''
    client = InfluxDBClient(url=URL, token=TOKEN, org=ORG, ssl_ca_cert=certifi.where())
    query_api = client.query_api()
    tables = query_api.query(query)
    output = tables.to_json()
    output = json.loads(output)
    for j in output:
        del j["table"]
        del j["result"]
    
    for data_point in output:
        data_point["time"] = data_point.pop("_time")

    return output

def getlatestdata(topic):
    '''
    Retrieves the latest data point from the data source with the desired topic

    (Returns the latest single data point)
    '''

    query = f'''
    from(bucket: "{bucket}")
  |> range(start: 0, stop: now())
  |> last()
  |> filter(fn: (r) =>
    r._measurement == "mqtt_consumer" and
    r.topic == "{topic}")
  |> keep(columns: ["topic", "_time", "_value", "_field"])
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")

    '''

    return query_influx(query)

def get_data_over_time_period(topic, start_time, end_time):
    '''
    Retrieves data with the desired topic over the time period specified
    '''
    # start_time = start_time + "Z"
    # end_time = end_time + "Z"

    query = f'''
    from(bucket: "{bucket}")
  |> range(start: {start_time}, stop: {end_time})
  |> filter(fn: (r) =>
    r._measurement == "mqtt_consumer" and
    r.topic == "{topic}")
  |> keep(columns: ["topic", "_time", "_value", "_field"])
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  
    '''
    print(query)

    #   |> keep(columns: ["topic", "_time", "_value", "_field"]) |> aggregateWindow(every: 1h, fn: sum, column: "_value")

    return query_influx(query)

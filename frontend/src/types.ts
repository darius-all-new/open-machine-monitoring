/*
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
*/

export const colourScheme = {
  red: "#f53e2a",
  orange: "#f5992a",
  green: "#49c414",
  grey: "#eeeeee",
  mainButton: "#1463b3",
  mainButtonHover: "#96c0eb",
  mainButtonText: "white",
  mainButtonTextHover: "black",
};

/*
The uptime bounds for "bad" and "good"
*/
export const uptimeBounds = {
  bad: 65,
  good: 80,
};

/*
The bounds for electrical current for whether a machine is considered "on" or "off" (between the 2 is considered "idle")
*/
export const currentBounds = {
  off: 0.5,
  on: 1.5,
};

/*
Represents a connected asset (e.g. a CNC machine)

An Asset has a manufacturer, a model, a topic (MQTT), an id (in the DB),
a status and a usage data data structure (containing time spent in the different statuses)
*/
export interface Asset {
  manufacturer: string;
  model: string;
  topic: string;
  id: number;
  status: string;
  usage_data: Record<string, number>;
}

/*
Data point with a timestamp and several other attributes.
*/
export interface Data {
  [key: string]: number | string | boolean;
  time: string;
}

/*
A Usage Record holds information on an asset's usage (time spent in each status)
*/
export interface UsageRecord {
  id: number;
  asset_id: number;
  time_on: number;
  time_off: number;
  time_idle: number;
  date: string;
  uptime?: number;
}

/*
A collection of Usage Records for a given asset
*/
export interface UsageRecordForAsset {
  usageRecords: UsageRecord[];
  asset_id: number;
}

/*
Simple structure to hold uptime data and the relevant date
*/
export interface UptimeDataStruct {
  date: string;
  uptime: number;
}

export interface BasicFunctionReturn {
  status: string;
  message?: string;
}

/*
Holds information from settings
*/
export interface Settings {
  id: number;
  day_duration: number;
  week_start: string;
}

/*
Holds information for periods of a given activity (status)

Used for the time line view
*/
export interface Range {
  time_begin: string;
  time_end: string;
  status: string;
  duration: number;
}

/*
Holds information on status for a given time
*/
export interface ProcessedData {
  time: string;
  status: "Up" | "Down" | "Idle";
}

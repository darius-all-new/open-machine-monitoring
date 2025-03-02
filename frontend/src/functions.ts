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

import {
  Asset,
  BasicFunctionReturn,
  Data,
  Settings,
  BackendSettings,
  UptimeDataStruct,
  UsageRecord,
  Downtime,
} from "./types";
import { config, getApiUrl } from './config';

type SetAssetsFunction = React.Dispatch<React.SetStateAction<Asset[]>>;
type SetAssetFunction = React.Dispatch<React.SetStateAction<Asset>>;
type SetDataFunction = React.Dispatch<React.SetStateAction<Data[]>>;
type SetUsageRecordsFunction = (records: UsageRecord[]) => void;

export const formatTimeToHoursAndMinutes = (durationInSeconds: number) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  const formattedTime = `${hours.toFixed(0)}h ${minutes.toFixed(
    0
  )}m ${seconds.toFixed(0)}s`;
  // ${seconds.toFixed(0)}s`;
  return formattedTime;
};

/*
Get an asset with a given id
*/
export const fetchAsset = async (
  setAsset: SetAssetFunction,
  asset_id: number
) => {
  // TODO: Need to handle this properly
  if (asset_id == 0) {
    return;
  }
  try {
    const response = await fetch(getApiUrl(`/get-assets/${asset_id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const response_data = await response.json();
      setAsset(response_data);
      // return response_data;
    } else {
      console.error("Error:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

/*
Get all connected assets
*/
export const fetchAllAssets = async (setAssets: SetAssetsFunction) => {
  try {
    const response = await fetch(getApiUrl("/get-assets"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const response_data = await response.json();
      setAssets(response_data);
    } else {
      console.error("Error:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

/*
Update metrics (up/down/idle times) for each asset
*/
export const updateMetrics = async () => {
  try {
    const response = await fetch(getApiUrl("/calculate/day-metrics"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      // console.log(response);
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};

// TODO: If status hasn't been updated for a while then we need to assume disconnection and change status to "unknown" or similar.
/*
Update the status of each asset to the latest available
*/
export const updateAssetStatuses = async () => {
  try {
    const response = await fetch(getApiUrl("/update-asset-statuses"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      // console.log(response);
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};

/*
Create a new asset connection
*/
export const createNewAsset = async (
  manufacturer: string,
  model: string,
  topic: string
): Promise<BasicFunctionReturn> => {
  try {
    const response = await fetch(getApiUrl("/create-asset"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ manufacturer, model, topic }),
    });
    if (response.ok) {
      return { status: "ok" };
    } else {
      return { status: "error" };
    }
  } catch (error) {
    console.error("Error: ", error);
    return { status: "error" };
  }
};

/*
Retrieve data for an asset over a given time range 
*/
export const retrieveData = async (
  setData: SetDataFunction,
  asset_id: number,
  startTime: string,
  endTime: string
) => {
  try {
    const response = await fetch(
      getApiUrl(`/data/period?asset_id=${asset_id}&time_from=${startTime}&time_to=${endTime}`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ id: props.id, time: 240 }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      // console.log(data); // Process the array of JSON objects here
      setData(data);
    } else {
      console.error("Error:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

/*
Fetch all downtime events for an asset
*/
export const fetchDowntimesByAsset = async (assetId: number): Promise<Downtime[]> => {
  try {
    const response = await fetch(getApiUrl(`/get-downtimes-by-asset/${assetId}`));
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Error fetching downtimes:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching downtimes:", error);
    return [];
  }
};

/*
Fetch a specific downtime event by ID
*/
export const fetchDowntimeById = async (downtimeId: number): Promise<Downtime | null> => {
  try {
    const response = await fetch(getApiUrl(`/get-downtime/${downtimeId}`));
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Error fetching downtime:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching downtime:", error);
    return null;
  }
};

/*
Create a new downtime event
*/
export const createDowntime = async (downtimeData: {
  title: string;
  description: string;
  type: "planned" | "unplanned";
  start_time: string;
  end_time?: string;
  asset_id: number;
}): Promise<Downtime | null> => {
  try {
    const response = await fetch(getApiUrl("/create-downtime"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(downtimeData),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Error creating downtime:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error creating downtime:", error);
    return null;
  }
};

/*
Update an existing downtime event
*/
export const updateDowntime = async (
  downtimeId: number,
  downtimeData: {
    title?: string;
    description?: string;
    type?: "planned" | "unplanned";
    start_time?: string;
    end_time?: string;
  }
): Promise<Downtime | null> => {
  try {
    const response = await fetch(getApiUrl(`/update-downtime/${downtimeId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(downtimeData),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Error updating downtime:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error updating downtime:", error);
    return null;
  }
};

/*
Delete a downtime event
*/
export const deleteDowntime = async (downtimeId: number): Promise<boolean> => {
  try {
    const response = await fetch(getApiUrl(`/delete-downtime/${downtimeId}`), {
      method: "DELETE",
    });
    
    if (response.ok) {
      return true;
    } else {
      console.error("Error deleting downtime:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error deleting downtime:", error);
    return false;
  }
};

/*
Find a downtime event that overlaps with a specific time range for an asset
*/
export const findDowntimeForTimeRange = async (
  assetId: number,
  startTime: string,
  endTime: string
): Promise<Downtime | null> => {
  try {
    const downtimes = await fetchDowntimesByAsset(assetId);
    
    if (!downtimes || downtimes.length === 0) {
      return null;
    }
    
    // Convert input times to Date objects for comparison
    const rangeStart = new Date(startTime);
    const rangeEnd = endTime ? new Date(endTime) : new Date();
    
    // Find a downtime that overlaps with the specified time range
    const overlappingDowntime = downtimes.find(downtime => {
      const downtimeStart = new Date(downtime.start_time);
      const downtimeEnd = downtime.end_time ? new Date(downtime.end_time) : null;
      
      // If downtime has no end time (ongoing), it overlaps if it started before the range ends
      if (!downtimeEnd) {
        return downtimeStart <= rangeEnd;
      }
      
      // Check for overlap: downtime starts before range ends AND downtime ends after range starts
      return downtimeStart <= rangeEnd && downtimeEnd >= rangeStart;
    });
    
    return overlappingDowntime || null;
  } catch (error) {
    console.error("Error finding downtime for time range:", error);
    return null;
  }
};

/*
Returns the number of days to the start of the week (defined in settings) 
*/
export const calculateDaysToWeekStart = (startOfWeek: string): number => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = new Date().getDay();
  const startOfWeekIndex = daysOfWeek.indexOf(startOfWeek);

  if (currentDay == startOfWeekIndex) {
    return 7;
  }

  let daysDifference = currentDay - startOfWeekIndex;

  if (daysDifference < 0) {
    daysDifference += 7; // Add 7 days to wrap around to the next week
  }

  return daysDifference;
};

/*
Returns the number of days since the start of the current year (from today)
*/
export const calculateDaysSinceYearStart = (): number => {
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const diffInMilliseconds = currentDate.getTime() - startOfYear.getTime();
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const daysSinceYearStart = Math.floor(diffInMilliseconds / millisecondsInDay);
  return daysSinceYearStart;
};

/*
Retrieve usage records for all assets (or one specific asset) over a given number of days
*/
export const fetchUsageRecords = async (
  numberOfDays: number,
  setUsageRecords: SetUsageRecordsFunction,
  startDate?: Date,
  assetOfInterest?: number
) => {
  try {
    let response: Response;
    if (assetOfInterest) {
      response = await fetch(
        getApiUrl(`/usage-records-for-asset?asset_id=${assetOfInterest}&days=${numberOfDays}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      response = await fetch(
        getApiUrl(`/usage-records-for-all-assets?days=${numberOfDays}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (response.ok) {
      const response_data = await response.json();
      setUsageRecords(response_data);
    } else {
      console.error("Error:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

/*
Retrieve settings
*/
export const fetchSettings = async () => {
  try {
    const response = await fetch(getApiUrl("/settings"), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const response_data = await response.json();
      return response_data;
    } else {
      console.error("Error");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};

/*
Make changes to settings
*/
export const changeSettings = async (updatedSettings: BackendSettings) => {
  try {
    // TODO: hardcoded settings_id
    const response = await fetch(getApiUrl("/update-settings?settings_id=1"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSettings),
    });
    if (response.ok) {
    } else {
      console.error("error:", response.statusText);
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};

/*
Returns the uptime (% time spent in the "on" status) for a single usage record
*/
export const calculateSingleUptime = (dataPoint: UsageRecord): number => {
  const uptime =
    dataPoint.time_on == 0
      ? 0
      : (100 * dataPoint.time_on) /
        60 /
        (dataPoint.time_on / 60 +
          dataPoint.time_idle / 60 +
          dataPoint.time_off / 60);

  return uptime;
};

/*
Returns the uptime (% time spent in the "on" status) for an array of usage records
*/
export const calculateUptime = (data: UsageRecord[]): UptimeDataStruct[] => {
  return data.map((item) => {
    const { time_off, time_on, date, time_idle } = item;
    const total = time_on + time_off + time_idle;
    const uptime = time_on === 0 ? 0 : (time_on / total) * 100;

    return {
      date,
      uptime,
    };
  });
};

/*
Returns the average uptime for an array of usage records
*/
export const calculateAverageUptime = (usageRecordArray: UsageRecord[]) => {
  const averageUptimeMap = usageRecordArray.reduce((map, item) => {
    if (!map.has(item.asset_id)) {
      map.set(item.asset_id, { totalUptime: 0, count: 0 });
    }
    const entry = map.get(item.asset_id) || { totalUptime: 0, count: 0 };
    entry.totalUptime += item.uptime || 0;
    entry.count++;
    return map;
  }, new Map<number, { totalUptime: number; count: number }>());

  const averageUptimes = Array.from(averageUptimeMap.entries()).map(
    ([asset_id, { totalUptime, count }]) => ({
      asset_id,
      average_uptime: totalUptime / count,
    })
  );

  return averageUptimes;
};

/*
Returns a summary sentence describing the trend in some uptime data
i.e. is the data trending up, or down or is it roughly consitent.
*/
export const determineTrend = (data: UptimeDataStruct[]): string => {
  if (data.length == 1) {
    return "No trend available";
  }
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  data.forEach((point, index) => {
    const x = index + 1;
    const y = point.uptime;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += Math.pow(x, 2);
  });

  const meanX = sumX / n;
  const meanY = sumY / n;

  const numerator = sumXY - n * meanX * meanY;
  const denominator = sumX2 - n * Math.pow(meanX, 2);

  const gradient = numerator / denominator;

  // TODO: Tune the gradient bounds
  if (gradient > 1) {
    return `Uptime has been trending upwards this week`;
  } else if (gradient < -1) {
    return `Uptime has been trending downwards this week`;
  } else {
    return `Uptime has been consistent this week`;
  }
};

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

import { Grid, GridItem, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  Asset,
  Data,
  ProcessedData,
  Range,
  colourScheme,
  currentBounds,
} from "../types";
import DayTimeline from "./DayTimeline";
import DayTimelineScale from "./DayTimelineScale";

// TODO: ProcessedData and Range need to go to types.ts ... ?

interface Props {
  asset: Asset;
  startHour: number;
  endHour: number;
}

const TimeBarPanel = (props: Props) => {
  const [currentData, setCurrentData] = useState<Data[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const [timeRangeData, setTimeRangeData] = useState<Range[]>([]);

  const xAxisData = [
    {
      time_begin: "2023-06-23T00:00:00.00",
      time_end: "2023-06-23T01:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "00:00 - 01:00",
    },
    {
      time_begin: "2023-06-23T01:00:00.00",
      time_end: "2023-06-23T02:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "01:00 - 02:00",
    },
    {
      time_begin: "2023-06-23T02:00:00.00",
      time_end: "2023-06-23T03:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "02:00 - 03:00",
    },
    {
      time_begin: "2023-06-23T03:00:00.00",
      time_end: "2023-06-23T04:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "03:00 - 04:00",
    },
    {
      time_begin: "2023-06-23T04:00:00.00",
      time_end: "2023-06-23T05:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "04:00 - 05:00",
    },
    {
      time_begin: "2023-06-23T05:00:00.00",
      time_end: "2023-06-23T06:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "05:00 - 06:00",
    },
    {
      time_begin: "2023-06-23T06:00:00.00",
      time_end: "2023-06-23T07:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "06:00 - 07:00",
    },
    {
      time_begin: "2023-06-23T07:00:00.00",
      time_end: "2023-06-23T08:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "07:00 - 08:00",
    },
    {
      time_begin: "2023-06-23T08:00:00.00",
      time_end: "2023-06-23T09:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "08:00 - 09:00",
    },
    {
      time_begin: "2023-06-23T09:00:00.00",
      time_end: "2023-06-23T10:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "09:00 - 10:00",
    },
    {
      time_begin: "2023-06-23T10:00:00.00",
      time_end: "2023-06-23T11:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "10:00 - 11:00",
    },
    {
      time_begin: "2023-06-23T11:00:00.00",
      time_end: "2023-06-23T12:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "11:00 - 12:00",
    },
    {
      time_begin: "2023-06-23T12:00:00.00",
      time_end: "2023-06-23T13:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "12:00 - 13:00",
    },
    {
      time_begin: "2023-06-23T13:00:00.00",
      time_end: "2023-06-23T14:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "13:00 - 14:00",
    },
    {
      time_begin: "2023-06-23T14:00:00.00",
      time_end: "2023-06-23T15:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "14:00 - 15:00",
    },
    {
      time_begin: "2023-06-23T15:00:00.00",
      time_end: "2023-06-23T16:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "15:00 - 16:00",
    },
    {
      time_begin: "2023-06-23T16:00:00.00",
      time_end: "2023-06-23T17:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "16:00 - 17:00",
    },
    {
      time_begin: "2023-06-23T17:00:00.00",
      time_end: "2023-06-23T18:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "17:00 - 18:00",
    },
    {
      time_begin: "2023-06-23T18:00:00.00",
      time_end: "2023-06-23T19:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "18:00 - 19:00",
    },
    {
      time_begin: "2023-06-23T19:00:00.00",
      time_end: "2023-06-23T20:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "19:00 - 20:00",
    },
    {
      time_begin: "2023-06-23T20:00:00.00",
      time_end: "2023-06-23T21:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "20:00 - 21:00",
    },
    {
      time_begin: "2023-06-23T21:00:00.00",
      time_end: "2023-06-23T22:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "21:00 - 22:00",
    },
    {
      time_begin: "2023-06-23T22:00:00.00",
      time_end: "2023-06-23T23:00:00.00",
      status: "Up",
      duration: 60 * 60000,
      text: "22:00 - 23:00",
    },
    {
      time_begin: "2023-06-23T23:00:00.00",
      time_end: "2023-06-23T23:59:59.00",
      status: "Up",
      duration: 60 * 60000,
      text: "23:00 - 24:00",
    },
  ];

  const transformData = (data: ProcessedData[]): Range[] => {
    const transformedData: Range[] = [];

    let currentRange: Range | null = null;

    for (const point of data) {
      if (currentRange === null) {
        // Start a new range
        currentRange = {
          time_begin: point.time,
          time_end: point.time,
          status: point.status,
          duration: 0,
        };
      } else if (point.status === currentRange.status) {
        // Expand the current range
        currentRange.time_end = point.time;
      } else {
        // End the current range and start a new one
        currentRange.duration =
          new Date(currentRange.time_end).getTime() -
          new Date(currentRange.time_begin).getTime();
        transformedData.push(currentRange);
        currentRange = {
          time_begin: point.time,
          time_end: point.time,
          status: point.status,
          duration: 0,
        };
      }
    }

    // Do the last one
    if (currentRange !== null) {
      currentRange.duration =
        new Date(currentRange.time_end).getTime() -
        new Date(currentRange.time_begin).getTime();
      transformedData.push(currentRange);
    }

    const transformedDataComplete = transformedData.map((point) => {
      if (point.duration === 0) {
        return {
          ...point,
          duration: 60000,
        };
      } else {
        return point;
      }
    });

    return transformedDataComplete;
  };

  const fetchData = async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");

      // TODO: Test behaviour with BST ...
      const startTime = `${year}-${month}-${day}T00:00:00.00Z`;
      const endTime = `${year}-${month}-${day}T23:59:59.00Z`;

      // TODO: Use the retrieveData function from functions.ts
      const response = await fetch(
        `http://localhost:8000/data/period?asset_id=${props.asset.id}&time_from=${startTime}&time_to=${endTime}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data: Data[] = await response.json();

        setCurrentData(data);
        processData(data);
      } else {
        console.error("Error:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const processData = (data: Data[]) => {
    const processedArray: ProcessedData[] = data.map((item) => {
      let status: "Up" | "Down" | "Idle";

      if ((item.current as number) < currentBounds.off) {
        status = "Down";
      } else if (
        (item.current as number) >= currentBounds.off &&
        (item.current as number) <= currentBounds.on
      ) {
        status = "Idle";
      } else {
        status = "Up";
      }

      return {
        time: item.time,
        status,
      };
    });

    setProcessedData(processedArray);

    setTimeRangeData(transformData(processedArray));
  };

  useEffect(() => {
    fetchData();

    // TODO: Allow users to set the refresh rate
    const intervalFetch = setInterval(fetchData, 5000);

    return () => {
      clearInterval(intervalFetch);
    };
  }, []);

  return (
    <>
      <Grid py={1} templateColumns="minmax(200px, max-content) 1fr" gap={4}>
        <GridItem
          bg={
            props.asset.status === "on"
              ? colourScheme.green
              : props.asset.status === "off"
              ? colourScheme.red
              : props.asset.status === "idle"
              ? colourScheme.orange
              : colourScheme.grey
          }
          p={4}
        >
          <Text fontSize="2xl">{props.asset.manufacturer}</Text>
          <Text>{props.asset.model}</Text>
          <Text>Status: {props.asset.status}</Text>
        </GridItem>
        <GridItem bg="gray.200" py={4} width="100%" overflowX="hidden">
          <DayTimeline
            startHour={props.startHour}
            endHour={props.endHour}
            activities={timeRangeData}
          />
          <DayTimelineScale
            startHour={props.startHour}
            endHour={props.endHour}
            activities={xAxisData}
          />
        </GridItem>
      </Grid>
    </>
  );
};

export default TimeBarPanel;

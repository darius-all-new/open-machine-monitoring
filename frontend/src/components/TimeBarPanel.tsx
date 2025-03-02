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

import { Box, Grid, Text, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  Asset,
  Data,
  ProcessedData,
  Range,
  colourScheme,
  currentBounds,
} from "../types";
import { useSettings } from "../SettingsContext";
import DayTimeline from "./DayTimeline";
import DayTimelineScale from "./DayTimelineScale";
import { getApiUrl } from "../config";

interface Props {
  asset: Asset;
  startHour: number;
  endHour: number;
  onDowntimeClick: (
    activity: Range,
    assetId: number,
    assetName: string
  ) => void;
}

const TimeBarPanel = (props: Props) => {
  const [currentData, setCurrentData] = useState<Data[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const [timeRangeData, setTimeRangeData] = useState<Range[]>([]);
  const { settings } = useSettings();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  // Return early if we don't have valid settings
  if (!settings || typeof settings.day_start_hour === 'undefined' || typeof settings.day_end_hour === 'undefined') {
    return null;
  }

  // Generate timeline scale data based on settings
  const generateTimelineData = () => {
    const data: Range[] = [];
    for (let i = settings.day_start_hour; i < settings.day_end_hour; i++) {
      const hour = i.toString().padStart(2, '0');
      const nextHour = (i + 1).toString().padStart(2, '0');
      data.push({
        time_begin: `2023-06-23T${hour}:00:00.00`,
        time_end: `2023-06-23T${nextHour}:00:00.00`,
        status: "Up",
        duration: 60 * 60000,
        text: `${hour}:00 - ${nextHour}:00`
      });
    }
    return data;
  };

  const xAxisData = generateTimelineData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const day = today.getDate().toString().padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        // Construct start and end times using settings
        const startHour = settings.day_start_hour.toString().padStart(2, "0");
        const endHour = settings.day_end_hour.toString().padStart(2, "0");
        const startTime = `${dateStr}T${startHour}:00:00.00Z`;
        const endTime = `${dateStr}T${endHour}:00:00.00Z`;

        const response = await fetch(
          getApiUrl(
            `/get-data-over-time-period?topic=${encodeURIComponent(props.asset.topic)}&start_time=${startTime}&end_time=${endTime}`
          )
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        setCurrentData(data);

        // Process the data into status points
        const processedPoints: ProcessedData[] = data.map((point: Data) => ({
          time: point.time,
          status:
            typeof point.current === 'number' && point.current < currentBounds.off
              ? "Down"
              : typeof point.current === 'number' && point.current >= currentBounds.on
              ? "Up"
              : "Idle",
        }));

        setProcessedData(processedPoints);

        // Process into time ranges
        const ranges: Range[] = [];
        let currentRange: Range | null = null;

        for (const point of processedPoints) {
          const pointTime = new Date(point.time);
          const hour = pointTime.getHours();
          
          // Skip points outside the configured day hours
          if (hour < settings.day_start_hour || hour >= settings.day_end_hour) {
            continue;
          }

          if (!currentRange) {
            currentRange = {
              time_begin: point.time,
              time_end: point.time,
              status: point.status,
              duration: 0,
              text: `${new Date(point.time).toLocaleTimeString()} - Present`
            };
          } else if (currentRange.status !== point.status) {
            currentRange.time_end = point.time;
            currentRange.duration = new Date(point.time).getTime() - new Date(currentRange.time_begin).getTime();
            currentRange.text = `${new Date(currentRange.time_begin).toLocaleTimeString()} - ${new Date(point.time).toLocaleTimeString()}`;
            ranges.push(currentRange);
            currentRange = {
              time_begin: point.time,
              time_end: point.time,
              status: point.status,
              duration: 0,
              text: `${new Date(point.time).toLocaleTimeString()} - Present`
            };
          }
        }

        if (currentRange && processedPoints.length > 0) {
          currentRange.time_end = processedPoints[processedPoints.length - 1].time;
          currentRange.duration = new Date(currentRange.time_end).getTime() - new Date(currentRange.time_begin).getTime();
          currentRange.text = `${new Date(currentRange.time_begin).toLocaleTimeString()} - ${new Date(currentRange.time_end).toLocaleTimeString()}`;
          ranges.push(currentRange);
        }

        setTimeRangeData(ranges);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [props.asset.topic, settings]);

  return (
    <Grid
      templateColumns="200px 1fr"
      gap={4}
      alignItems="center"
      bg={bgColor}
      p={4}
      borderRadius="md"
      boxShadow="sm"
    >
      <Box>
        <Text fontWeight="medium">{`${props.asset.manufacturer} ${props.asset.model}`}</Text>
        <Text fontSize="sm" color={textColor}>
          {props.asset.topic}
        </Text>
      </Box>
      <Box position="relative">
        <DayTimelineScale xAxisData={xAxisData} startHour={props.startHour} endHour={props.endHour} />
        <DayTimeline
          activities={timeRangeData}
          startHour={props.startHour}
          endHour={props.endHour}
          assetId={props.asset.id}
          assetName={`${props.asset.manufacturer} ${props.asset.model}`}
          onDowntimeClick={props.onDowntimeClick}
        />
      </Box>
    </Grid>
  );
};

export default TimeBarPanel;

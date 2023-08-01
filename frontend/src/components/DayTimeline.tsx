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

import { Box, Text, Tooltip } from "@chakra-ui/react";
import { formatTimeToHoursAndMinutes } from "../functions";
import { Range, colourScheme } from "../types";

interface Props {
  activities: Range[];
  startHour: number;
  endHour: number;
}

const DayTimeline = (props: Props) => {
  const regionStartTime = props.startHour * 60 * 60 * 1000;
  const regionEndTime = props.endHour * 60 * 60 * 1000;

  const dayDuration = regionEndTime - regionStartTime; // Number of milliseconds

  const convertToMilliseconds = (timeString: string): number => {
    const date = new Date(timeString);
    return date.getTime();
  };

  const getMillisecondsForDayStart = (dateString: string): number => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const dateStartOfDay = new Date(year, month, day, props.startHour, 0, 0, 0); // Months are zero indexed

    return dateStartOfDay.getTime();
  };

  const calculateBlockWidth = (activity: Range): string => {
    const startTime = convertToMilliseconds(activity.time_begin);
    const endTime = convertToMilliseconds(activity.time_end);
    const duration = endTime - startTime;
    const widthPercentage = (duration / dayDuration) * 100;
    return `${widthPercentage}%`;
  };

  const calculateBlockLeft = (activity: Range): string => {
    const startTime = convertToMilliseconds(activity.time_begin);
    const startOfTheDay = getMillisecondsForDayStart(activity.time_begin);

    const relativeStartTime = startTime - startOfTheDay;
    const startPercentage = (relativeStartTime / dayDuration) * 100;
    return `${startPercentage}%`;
  };

  const convertTimestampToReadable = (timestamp: string) => {
    const dateObj = new Date(timestamp);
    // TODO: Location support
    return dateObj.toLocaleString("en-GB");
  };

  return (
    <Box bg="gray.200" height="50px" position="relative">
      {props.activities.map((activity, index) => (
        <Tooltip
          key={index}
          label={
            <>
              <Text>{`Status: ${activity.status}`}</Text>
              <Text>
                {`Duration: ${formatTimeToHoursAndMinutes(
                  activity.duration / 1000
                )}`}
              </Text>
              <Text>{`Start: ${convertTimestampToReadable(
                activity.time_begin
              )}`}</Text>
              <Text>{`End: ${convertTimestampToReadable(
                activity.time_end
              )}`}</Text>
            </>
          }
        >
          <Box
            borderRadius="md"
            key={index}
            position="absolute"
            bg={
              activity.status === "Up"
                ? colourScheme.green
                : activity.status === "Down"
                ? colourScheme.red
                : colourScheme.orange
            }
            opacity={1.0}
            height="100%"
            top="0"
            left={calculateBlockLeft(activity)}
            width={calculateBlockWidth(activity)}
          >
            <Text color="white">
              {parseFloat(calculateBlockWidth(activity)) > 9
                ? formatTimeToHoursAndMinutes(activity.duration / 1000)
                : ""}
            </Text>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default DayTimeline;

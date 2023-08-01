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

import { Box, Text } from "@chakra-ui/react";

interface Range {
  time_begin: string;
  time_end: string;
  status: string;
  duration: number;
  text: string;
}

interface Props {
  activities: Range[];
  startHour: number;
  endHour: number;
}

const DayTimelineScale = (props: Props) => {
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

    const dateStartOfDay = new Date(year, month, day, props.startHour, 0, 0, 0); // Months are zero-indexed

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

  const getHours = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hoursString = date.getHours();
    return hoursString.toString().padStart(2, "0") + ":00";
  };

  return (
    <Box bg="gray.200" height="50px" position="relative">
      {props.activities.map((activity, index) => (
        <Box
          key={index}
          position="absolute"
          bg="white"
          opacity={1.0}
          height="100%"
          top="0"
          left={calculateBlockLeft(activity)}
          width={calculateBlockWidth(activity)}
        >
          <Text fontSize="sm" color="gray.600">
            {getHours(activity.time_begin)}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default DayTimelineScale;

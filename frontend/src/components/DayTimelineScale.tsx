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

import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { Range } from "../types";

interface Props {
  startHour: number;
  endHour: number;
  xAxisData: Range[];
}

const DayTimelineScale = (props: Props) => {
  // Move all hook calls to the top
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const regionStartTime = props.startHour * 60 * 60 * 1000;
  const regionEndTime = props.endHour * 60 * 60 * 1000;
  const dayDuration = regionEndTime - regionStartTime;

  const convertToMilliseconds = (timeString: string): number => {
    const date = new Date(timeString);
    return date.getTime();
  };

  const getMillisecondsForDayStart = (dateString: string): number => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const dateStartOfDay = new Date(year, month, day, props.startHour, 0, 0, 0);
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
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <Box 
      height="24px" 
      position="relative" 
      mb={1}
      overflow="hidden"
      borderRadius="md"
    >
      {/* Time markers */}
      {props.xAxisData?.map((activity, index) => {
        const leftPosition = calculateBlockLeft(activity);
        const width = calculateBlockWidth(activity);
        const leftPercentage = parseFloat(leftPosition);
        
        // Only show time markers that are within view or near the edges
        if (leftPercentage < -10 || leftPercentage > 110) {
          return null;
        }

        return (
          <Box
            key={index}
            position="absolute"
            height="100%"
            top="0"
            left={leftPosition}
            width={width}
            borderLeft={index > 0 ? "1px" : "none"}
            borderColor={borderColor}
          >
            <Text
              fontSize="xs"
              color={textColor}
              position="absolute"
              left={1}
              top={0}
            >
              {getHours(activity.time_begin)}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default DayTimelineScale;

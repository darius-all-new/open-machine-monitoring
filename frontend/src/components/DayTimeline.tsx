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

import { Box, Text, Tooltip, Flex, useColorModeValue } from "@chakra-ui/react";
import { formatTimeToHoursAndMinutes } from "../functions";
import { Range, colourScheme } from "../types";

interface Props {
  activities: Range[];
  startHour: number;
  endHour: number;
  assetId: number;
  assetName: string;
  onDowntimeClick: (activity: Range, assetId: number, assetName: string) => void;
}

const DayTimeline = (props: Props) => {
  // Move all hook calls to the top
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const timelineOpacity = useColorModeValue(0.8, 0.9);
  const textColor = useColorModeValue("gray.700", "white");

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

  const getDurationInSeconds = (activity: Range): number => {
    const startTime = convertToMilliseconds(activity.time_begin);
    const endTime = convertToMilliseconds(activity.time_end);
    return (endTime - startTime) / 1000; // Convert milliseconds to seconds
  };

  const handleActivityClick = (activity: Range) => {
    // Only handle clicks on "Down" status activities
    if (activity.status === "Down") {
      props.onDowntimeClick(activity, props.assetId, props.assetName);
    }
  };

  return (
    <Box 
      bg={bgColor}
      height="40px" 
      position="relative" 
      borderRadius="md"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
    >
      {props.activities.map((activity, index) => (
        <Tooltip
          key={index}
          label={
            <Box p={1}>
              <Flex align="center" mb={2}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={
                    activity.status === "Up"
                      ? colourScheme.green
                      : activity.status === "Down"
                      ? colourScheme.red
                      : colourScheme.orange
                  }
                  mr={2}
                  boxShadow="md"
                />
                <Text color="white" fontWeight="medium">
                  {activity.status}
                </Text>
              </Flex>
              <Text color="white" fontSize="sm">
                From: {convertTimestampToReadable(activity.time_begin)}
              </Text>
              <Text color="white" fontSize="sm">
                To: {convertTimestampToReadable(activity.time_end)}
              </Text>
              <Text color="white" fontSize="sm" fontWeight="medium">
                Duration: {formatTimeToHoursAndMinutes(getDurationInSeconds(activity))}
              </Text>
              {activity.status === "Down" && (
                <Text color="white" fontSize="sm" fontStyle="italic" mt={1}>
                  Click to manage downtime event
                </Text>
              )}
            </Box>
          }
          hasArrow
          bg="gray.800"
          placement="top"
        >
          <Box
            position="absolute"
            height="100%"
            bg={
              activity.status === "Up"
                ? colourScheme.green
                : activity.status === "Down"
                ? colourScheme.red
                : colourScheme.orange
            }
            left={calculateBlockLeft(activity)}
            width={calculateBlockWidth(activity)}
            opacity={timelineOpacity}
            transition="opacity 0.2s"
            _hover={{ 
              opacity: 1,
              cursor: activity.status === "Down" ? "pointer" : "default" 
            }}
            onClick={() => handleActivityClick(activity)}
          >
            {parseFloat(calculateBlockWidth(activity)) > 9 && (
              <Flex
                height="100%"
                align="center"
                justify="center"
                px={2}
                color={textColor}
                fontSize="xs"
                fontWeight="medium"
                textShadow="0 1px 2px rgba(0,0,0,0.2)"
              >
                {formatTimeToHoursAndMinutes(getDurationInSeconds(activity))}
              </Flex>
            )}
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default DayTimeline;

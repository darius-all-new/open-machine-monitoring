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

import { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import { Asset, UsageRecord, colourScheme, uptimeBounds } from "../types";
import { calculateSingleUptime, fetchUsageRecords } from "../functions";
import { useSettings } from "../SettingsContext";

interface Props {
  asset: Asset;
  searchTerm: string;
}

const Calendar = (props: Props) => {
  const { settings } = useSettings();
  const [usageRecordData, setUsageRecordData] = useState<UsageRecord[]>([]);
  const [currentYear] = useState(() => new Date().getFullYear());

  // Add color mode values
  const emptyDayColor = useColorModeValue("gray.100", "gray.700");
  const monthLabelColor = useColorModeValue("gray.600", "gray.400");
  const dayLabelColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    // Fetch data for the entire year
    fetchUsageRecords(365, setUsageRecordData, undefined, props.asset?.id);
  }, [props.asset?.id]);

  const daysOfWeek = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startIdx = days.indexOf(settings.week_start);
    return [...days.slice(startIdx), ...days.slice(0, startIdx)];
  }, [settings.week_start]);

  const usageDataMinutes = useMemo(
    () =>
      usageRecordData.map((d) => ({
        date: new Date(d.date),
        uptime: d.time_on === 0 ? 0 : calculateSingleUptime(d),
      })),
    [usageRecordData]
  );

  const dateUptimeMap = useMemo(() => {
    const map = new Map<string, number>();
    usageDataMinutes.forEach(({ date, uptime }) => {
      const formattedDate = date.toLocaleDateString();
      map.set(formattedDate, uptime);
    });
    return map;
  }, [usageDataMinutes]);

  // Update determineBoxColor to handle dark mode better
  const determineBoxColor = useCallback(
    (uptime?: number): string => {
      if (uptime === undefined) return emptyDayColor;
      if (uptime >= uptimeBounds.good) {
        return colourScheme.green;
      }
      if (uptime >= uptimeBounds.bad) {
        return colourScheme.orange;
      }
      if (uptime < uptimeBounds.bad) {
        return colourScheme.red;
      }
      return emptyDayColor;
    },
    [emptyDayColor]
  );

  const weeks = useMemo(() => {
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = Array(7).fill(null);
    let currentDate = new Date(currentYear, 0, 1); // January 1st

    // Get the correct starting day index based on settings
    const daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startDayIndex = daysArray.indexOf(settings.week_start);

    // Calculate the day of week for January 1st (0-6)
    let firstDayOfWeek = currentDate.getDay();

    // Adjust the day index based on the week start setting
    firstDayOfWeek = (firstDayOfWeek - startDayIndex + 7) % 7;

    // Fill in the empty days before the first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek[i] = null;
    }

    // Fill in the rest of the year
    while (currentDate.getFullYear() === currentYear) {
      // Get the adjusted day of week based on week start setting
      const dayOfWeek = (currentDate.getDay() - startDayIndex + 7) % 7;

      if (dayOfWeek === 0 && currentWeek.some((d) => d !== null)) {
        weeks.push([...currentWeek]);
        currentWeek = Array(7).fill(null);
      }

      currentWeek[dayOfWeek] = new Date(currentDate);

      // Move to next day
      currentDate = new Date(currentDate.getTime() + 86400000);
    }

    // Push the last week if it has any days
    if (currentWeek.some((d) => d !== null)) {
      // Fill the rest of the week with null
      for (let i = currentWeek.length - 1; i >= 0; i--) {
        if (currentWeek[i] === null) break;
        if (currentWeek[i]?.getFullYear() !== currentYear) {
          currentWeek[i] = null;
        }
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentYear, settings.week_start]);

  const monthLabels = useMemo(() => {
    const months: { label: string; position: number }[] = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        if (day && day.getMonth() !== currentMonth) {
          currentMonth = day.getMonth();
          months.push({
            label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
              day
            ),
            position: weekIndex,
          });
        }
      });
    });

    return months;
  }, [weeks]);

  return (
    <Box width="100%" overflowX="auto" pb={2}>
      <Box minWidth="1200px" display="flex" justifyContent="center">
        <Box>
          {/* Month labels */}
          <Box position="relative" height="20px" mb={2} ml="30px">
            {monthLabels.map((month, idx) => (
              <Text
                key={idx}
                fontSize="xs"
                color={monthLabelColor}
                position="absolute"
                left={`${month.position * 12}px`}
                whiteSpace="nowrap"
                fontWeight="medium"
              >
                {month.label}
              </Text>
            ))}
          </Box>

          <Flex>
            {/* Days of week labels */}
            <Flex direction="column" mr={2}>
              {daysOfWeek.map((day, idx) => (
                <Text
                  key={idx}
                  fontSize="xs"
                  color={dayLabelColor}
                  height="10px"
                  lineHeight="10px"
                  mb="2px"
                  width="30px"
                  textAlign="right"
                  fontWeight="medium"
                >
                  {day}
                </Text>
              ))}
            </Flex>

            {/* Calendar grid */}
            <Flex>
              {weeks.map((week, weekIdx) => (
                <Flex key={weekIdx} direction="column" mr="1px">
                  {week.map((date, dayIdx) => {
                    if (!date)
                      return (
                        <Box
                          key={`empty-${dayIdx}`}
                          w="10px"
                          h="10px"
                          mb="2px"
                          bg="transparent"
                        />
                      );

                    const formattedDate = date.toLocaleDateString();
                    const uptime = dateUptimeMap.get(formattedDate);
                    const tooltipLabel = `${date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}: ${
                      uptime !== undefined ? uptime.toFixed(1) + "%" : "No data"
                    }`;

                    return (
                      <Tooltip
                        key={dayIdx}
                        label={tooltipLabel}
                        placement="top"
                        hasArrow
                      >
                        <Box
                          w="10px"
                          h="10px"
                          mb="2px"
                          bg={determineBoxColor(uptime)}
                          borderRadius="sm"
                          transition="transform 0.2s"
                          _hover={{
                            transform: "scale(1.2)",
                            zIndex: 1,
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;

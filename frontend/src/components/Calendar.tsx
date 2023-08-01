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

import { useEffect, useState } from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { Asset, UsageRecord, colourScheme, uptimeBounds } from "../types";
import {
  calculateDaysSinceYearStart,
  calculateSingleUptime,
  fetchUsageRecords,
} from "../functions";
import { useSettings } from "../SettingsContext";

interface Props {
  asset: Asset;
  searchTerm: string;
}

const Calendar = (props: Props) => {
  const { settings, updateSettings } = useSettings();
  const [usageRecordData, setUsageRecordData] = useState<UsageRecord[]>([]);

  const months = [
    { name: "Jan", days: 31 },
    { name: "Feb", days: 28 },
    { name: "Mar", days: 31 },
    { name: "Apr", days: 30 },
    { name: "May", days: 31 },
    { name: "Jun", days: 30 },
    { name: "Jul", days: 31 },
    { name: "Aug", days: 31 },
    { name: "Sep", days: 30 },
    { name: "Oct", days: 31 },
    { name: "Nov", days: 30 },
    { name: "Dec", days: 31 },
  ];

  useEffect(() => {
    fetchUsageRecords(
      calculateDaysSinceYearStart(),
      setUsageRecordData,
      props.asset.id
    );
  }, [settings, props.searchTerm]);

  const usageDataMinutes = usageRecordData.map((d) => ({
    ...d,
    uptime: d.time_on === 0 ? 0 : calculateSingleUptime(d),
  }));

  // Is the year a leap year?
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Update the number of days in February for leap years
  const updateDaysInFebruary = (year: number): void => {
    if (isLeapYear(year)) {
      months[1].days = 29;
    } else {
      months[1].days = 28;
    }
  };

  // Map dates to corresponding uptime values
  const dateUptimeMap = new Map<string, number>();

  usageDataMinutes.forEach(({ date, uptime }) => {
    dateUptimeMap.set(date, uptime);
  });

  // Determine the correct colour for a box based on the uptime
  const determineBoxColor = (uptime?: number): string => {
    if (uptime === undefined) {
      return "gray.300";
    }
    if (uptime >= uptimeBounds.good) {
      return colourScheme.green;
    }
    if (uptime < uptimeBounds.good && uptime >= uptimeBounds.bad) {
      return colourScheme.orange;
    }
    if (uptime < uptimeBounds.bad) {
      return colourScheme.red;
    }
    return "black";
  };

  // Function to render a box for each day
  const renderDayBox = (date: Date) => {
    const dateString = date.toDateString();

    // TODO: Watch out for BST? Needs testing
    const formattedDateString = date.toLocaleDateString().split("T")[0];
    const dataPoint = usageDataMinutes.find((item) => {
      const itemDateString = new Date(item.date)
        .toLocaleDateString()
        .split("T")[0];
      return itemDateString === formattedDateString;
    });

    const uptime = dataPoint?.uptime;

    const boxColor = determineBoxColor(uptime);

    const tooltipLabel = `${date.toLocaleDateString("en-GB")} - Uptime: ${
      uptime !== undefined ? uptime.toFixed(2) + "%" : "No data"
    }`;

    return (
      <Tooltip key={dateString} label={tooltipLabel}>
        <Box
          key={dateString}
          width="20px"
          height="20px"
          backgroundColor={boxColor}
          marginRight="4px"
          marginBottom="4px"
        />
      </Tooltip>
    );
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  updateDaysInFebruary(currentYear);

  return (
    <Flex direction="column" alignItems="flex-start">
      {months.map(({ name, days }, index) => {
        return (
          <Flex key={`f1-${index}`} alignItems="flex-start">
            <Text key={`t1-${index}`} marginRight="8px">
              {name}
            </Text>
            <Flex key={`f2-${index}`} flexWrap="wrap">
              {Array.from({ length: days }, (_, i) => {
                const date = new Date(currentYear, index, i + 1);
                return renderDayBox(date);
              })}
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default Calendar;

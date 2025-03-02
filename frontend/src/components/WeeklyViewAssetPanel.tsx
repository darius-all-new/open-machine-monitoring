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
import { Asset, UsageRecord } from "../types";
import { calculateDaysToWeekStart, fetchUsageRecords } from "../functions";
import { useSettings } from "../SettingsContext";
import BarChartComponent from "./BarChartComponent";
import { Box, Flex, Text, Heading, Center, Divider, useColorModeValue } from "@chakra-ui/react";
import { FiBox } from "react-icons/fi";
import TrendMessage from "./TrendMessage";

interface Props {
  asset: Asset;
  searchTerm: string;
}

const WeeklyViewAssetPanel = (props: Props) => {
  const { settings } = useSettings();
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const headerColor = useColorModeValue("blue.500", "blue.200");
  const headingColor = useColorModeValue("gray.700", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const chartBg = useColorModeValue("white", "gray.800");
  const trendBg = useColorModeValue("blue.50", "blue.900");
  const trendColor = useColorModeValue("gray.700", "gray.100");
  const noDataColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const [usageRecordData, setUsageRecordData] = useState<UsageRecord[]>([]);

  useEffect(() => {
    fetchUsageRecords(
      calculateDaysToWeekStart(settings.week_start),
      setUsageRecordData,
      undefined,
      props.asset.id
    );
  }, [settings, props.searchTerm, props.asset.id]);

  return (
    <Box 
      p={6} 
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={useColorModeValue("sm", "dark-lg")}
    >
      {/* Asset Header */}
      <Flex align="center" mb={4}>
        <Box
          bg={headerBg}
          p={2}
          borderRadius="lg"
          mr={3}
          color={headerColor}
        >
          <FiBox size={20} />
        </Box>
        <Box>
          <Heading size="sm" mb={1} color={headingColor}>
            {props.asset.manufacturer}
          </Heading>
          <Text 
            color={subTextColor}
            fontSize="sm"
            fontWeight="medium"
          >
            {props.asset.model}
          </Text>
        </Box>
      </Flex>

      <Divider mb={4} borderColor={borderColor} />

      {usageRecordData.length > 0 ? (
        <Box>
          <Box 
            mb={4} 
            bg={chartBg}
            p={3} 
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <BarChartComponent data={usageRecordData} />
          </Box>
          <Box 
            bg={trendBg}
            p={4} 
            borderRadius="lg"
            color={trendColor}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <TrendMessage usageData={usageRecordData} />
          </Box>
        </Box>
      ) : (
        <Center p={8}>
          <Text color={noDataColor}>No data available for this week</Text>
        </Center>
      )}
    </Box>
  );
};

export default WeeklyViewAssetPanel;

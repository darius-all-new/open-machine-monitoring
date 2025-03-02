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
import NavBar from "../components/NavBar";
import { useSettings } from "../SettingsContext";
import { UsageRecord, colourScheme } from "../types";
import {
  calculateAverageUptime,
  calculateDaysToWeekStart,
  calculateSingleUptime,
  fetchUsageRecords,
} from "../functions";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Icon,
  Badge,
} from "@chakra-ui/react";
import RankingAssetPanel from "../components/RankingAssetPanel";
import { FiAward, FiArrowUp, FiArrowDown } from "react-icons/fi";

const RankingView = () => {
  const { settings, updateSettings } = useSettings();
  const [usageRecordsForAllAssets, setUsageRecordsForAllAssets] = useState<
    UsageRecord[]
  >([]);

  const [
    usageRecordsForAllAssetsPreviousWeek,
    setUsageRecordsForAllAssetsPreviousWeek,
  ] = useState<UsageRecord[]>([]);

  const [averageUsageArray, setAverageUsageArray] = useState([
    { asset_id: 0, average_uptime: 0.0 },
  ]);

  const [averageUsagePreviousWeekArray, setAverageUsagePreviousWeekArray] =
    useState([
      {
        asset_id: 0,
        average_uptime: 0.0,
      },
    ]);

  const [bestFirst, setBestFirst] = useState(true);
  const currentDate = new Date();
  const startOfWeek = new Date();
  startOfWeek.setDate(
    currentDate.getDate() - calculateDaysToWeekStart(settings.week_start)
  );
  startOfWeek.setHours(0, 0, 0);

  // Theme colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const weekStartBgColor = useColorModeValue("blue.50", "blue.900");
  const assetHoverBorderColor = useColorModeValue("blue.200", "blue.500");

  const averageUsageArraySorted = [...averageUsageArray].sort((a, b) => {
    if (bestFirst) {
      return b.average_uptime - a.average_uptime;
    } else {
      return a.average_uptime - b.average_uptime;
    }
  });

  const usageDataMinutes = usageRecordsForAllAssets.map((d) => ({
    ...d,
    uptime: calculateSingleUptime(d),
  }));

  const usageDataPreviousWeekMinutes = usageRecordsForAllAssetsPreviousWeek
    .filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate < startOfWeek;
    })
    .map((d) => ({
      ...d,
      uptime: calculateSingleUptime(d),
    }));

  useEffect(() => {
    const daysToStartOfThisWeek = calculateDaysToWeekStart(settings.week_start);
    const daysToStartOfPreviousWeek = daysToStartOfThisWeek + 7;

    fetchUsageRecords(daysToStartOfThisWeek, setUsageRecordsForAllAssets);

    fetchUsageRecords(
      daysToStartOfPreviousWeek,
      setUsageRecordsForAllAssetsPreviousWeek
    );
  }, [settings]);

  useEffect(() => {
    const averageUptimes = calculateAverageUptime(usageDataMinutes);
    setAverageUsageArray(averageUptimes);

    const averageUptimesPreviousWeek = calculateAverageUptime(
      usageDataPreviousWeekMinutes
    );
    setAverageUsagePreviousWeekArray(averageUptimesPreviousWeek);
  }, [usageRecordsForAllAssets, usageRecordsForAllAssetsPreviousWeek]);

  const switchOrder = () => {
    setBestFirst(!bestFirst);
  };

  return (
    <>
      <NavBar />
      <Box maxW="1400px" mx="auto" px={5} py={8}>
        {/* Header Section */}
        <Box mb={8}>
          <Flex align="center" gap={3} mb={2}>
            <Heading
              size="2xl"
              py={3}
              display="flex"
              alignItems="center"
              gap={4}
            >
              Asset Rankings
              <Icon as={FiAward} color={colourScheme.mainButton} boxSize={8} />
            </Heading>
          </Flex>
          <Text
            fontSize="lg"
            color={useColorModeValue("gray.600", "gray.200")}
            pb={8}
          >
            View and compare asset performance rankings based on uptime. Track
            which assets are performing best and identify those that may need
            attention.
          </Text>
        </Box>

        {/* Week Info & Sort Section */}
        <Box
          p={4}
          bg={bgColor}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          mb={6}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={4}
            mb={6}
          >
            {/* Week Start Info */}
            <Flex
              align="center"
              bg={weekStartBgColor}
              p={3}
              borderRadius="md"
              color="blue.600"
            >
              <Text fontWeight="medium">
                Week starts on{" "}
                <Badge colorScheme="blue" fontSize="sm" px={2}>
                  {settings.week_start}
                </Badge>
              </Text>
            </Flex>

            {/* Sort Button */}
            <Button
              leftIcon={bestFirst ? <FiArrowDown /> : <FiArrowUp />}
              bgColor={colourScheme.mainButton}
              color={colourScheme.mainButtonText}
              _hover={{
                color: colourScheme.mainButtonTextHover,
                bgColor: colourScheme.mainButtonHover,
              }}
              onClick={switchOrder}
            >
              {bestFirst ? "Sort by Lowest Uptime" : "Sort by Highest Uptime"}
            </Button>
          </Flex>

          {/* Rankings Grid */}
          <Grid templateColumns="1fr" gap={4} maxW="800px" mx="auto">
            {averageUsageArraySorted.map((au, k) => (
              <GridItem
                key={k}
                bg={bgColor}
                borderRadius="xl"
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  borderColor: assetHoverBorderColor,
                }}
              >
                <RankingAssetPanel
                  asset_id={au.asset_id}
                  average_uptime={au.average_uptime}
                  last_week_uptime={
                    averageUsagePreviousWeekArray.find(
                      (obj) => obj.asset_id === au.asset_id
                    )?.average_uptime || "unavailable"
                  }
                  rank={k + 1}
                />
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default RankingView;

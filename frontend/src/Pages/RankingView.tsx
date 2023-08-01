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
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
} from "@chakra-ui/react";
import RankingAssetPanel from "../components/RankingAssetPanel";

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
      <Box p={5}>
        <Heading py={3}>Ranked View</Heading>
        <Text py={5}>
          This is the ranked view. Here you can see what assets have the most
          uptime and the least. Rankings are based on the current week.
        </Text>
        <Text>Weeks start on: {settings.week_start}</Text>
      </Box>

      <Container>
        <Button
          bgColor={colourScheme.mainButton}
          color={colourScheme.mainButtonText}
          _hover={{
            color: colourScheme.mainButtonTextHover,
            bgColor: colourScheme.mainButtonHover,
          }}
          size="lg"
          w="full"
          my={3}
          onClick={switchOrder}
        >
          {bestFirst ? "Sort ascending" : "Sort descending"}
        </Button>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(1, 1fr)",
            lg: "repeat(1, 1fr)",
          }}
          gap={4}
        >
          {averageUsageArraySorted.map((au, k) => {
            return (
              <GridItem mx={0} border="solid 1px" borderRadius="5px" key={k}>
                <RankingAssetPanel
                  asset_id={au.asset_id}
                  average_uptime={au.average_uptime}
                  last_week_uptime={
                    averageUsagePreviousWeekArray.find(
                      (obj) => obj.asset_id === au.asset_id
                    )?.average_uptime || "unavailable"
                  }
                  key={k}
                />
              </GridItem>
            );
          })}
        </Grid>
      </Container>
    </>
  );
};

export default RankingView;

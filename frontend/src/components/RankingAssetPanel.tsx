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

import {
  Box,
  Flex,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  Icon,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Asset, colourScheme } from "../types";
import { fetchAsset } from "../functions";
import { FiAward } from "react-icons/fi";

interface Props {
  asset_id: number;
  average_uptime: number;
  last_week_uptime: number | string;
  rank: number;
}

const RankingAssetPanel = (props: Props) => {
  const initAsset = {} as Asset;
  const [asset, setAsset] = useState<Asset>(initAsset);

  // Theme colors
  const textColor = useColorModeValue("gray.600", "gray.400");
  const statBgColor = useColorModeValue("gray.50", "gray.700");
  const rankColors = ["gold", "silver", "#CD7F32"]; // gold, silver, bronze

  useEffect(() => {
    fetchAsset(setAsset, props.asset_id);
  }, [props.asset_id]);

  let percentChangeUptime = 0;
  if (typeof props.last_week_uptime === "number") {
    percentChangeUptime =
      (100 * (props.average_uptime - props.last_week_uptime)) /
      props.last_week_uptime;
  }

  // Determine progress color based on uptime
  const getProgressColor = (uptime: number) => {
    if (uptime >= 80) return colourScheme.green;
    if (uptime >= 65) return colourScheme.orange;
    return colourScheme.red;
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center" gap={3}>
          {/* Rank Medal for top 3 */}
          {props.rank <= 3 && (
            <Icon as={FiAward} boxSize={6} color={rankColors[props.rank - 1]} />
          )}
          <Box>
            <Text fontSize="lg" fontWeight="bold">
              {asset?.manufacturer} {asset?.model}
            </Text>
            <Text fontSize="sm" color={textColor}>
              Rank #{props.rank}
            </Text>
          </Box>
        </Flex>

        <CircularProgress
          value={props.average_uptime}
          color={getProgressColor(props.average_uptime)}
          size="60px"
          thickness="8px"
        >
          <CircularProgressLabel>
            {props.average_uptime.toFixed(0)}%
          </CircularProgressLabel>
        </CircularProgress>
      </Flex>

      <Box bg={statBgColor} p={3} borderRadius="md">
        <Stat>
          <StatLabel>Weekly Performance</StatLabel>
          <StatNumber fontSize="xl">
            {props.average_uptime.toFixed(2)}%
          </StatNumber>
          <StatHelpText>
            {props.last_week_uptime === "unavailable" ? (
              <Text fontSize="sm">No data for last week</Text>
            ) : (
              <Flex align="center" gap={1}>
                <StatArrow
                  type={percentChangeUptime > 0 ? "increase" : "decrease"}
                />
                <Text>
                  {Math.abs(percentChangeUptime).toFixed(2)}% from previous week
                </Text>
              </Flex>
            )}
          </StatHelpText>
        </Stat>
      </Box>
    </Box>
  );
};

export default RankingAssetPanel;

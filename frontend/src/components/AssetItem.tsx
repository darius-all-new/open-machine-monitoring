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
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spacer,
} from "@chakra-ui/react";
import { Asset, colourScheme } from "../types";
import { formatTimeToHoursAndMinutes } from "../functions";

interface Props {
  asset: Asset;
  onDataViewClick: () => void;
}

const AssetItem = (props: Props) => {
  const upTimeRounded = props.asset.usage_data.time_on
    ? parseFloat(props.asset.usage_data.time_on.toFixed(2))
    : 0.0;
  const idleTimeRounded = props.asset.usage_data.time_idle
    ? parseFloat(props.asset.usage_data.time_idle.toFixed(2))
    : 0.0;
  const downTimeRounded = props.asset.usage_data.time_off
    ? parseFloat(props.asset.usage_data.time_off.toFixed(2))
    : 0.0;

  const getColour = (status: string) => {
    if (status === "on") {
      return colourScheme.green;
    }
    if (status === "idle") {
      return colourScheme.orange;
    }
    if (status === "off") {
      return colourScheme.red;
    }
    if (status === "unknown") {
      return colourScheme.grey;
    }
  };

  return (
    <Flex alignItems="center" p={4} border="1px solid" borderRadius="md">
      <Box flex={1}>
        <Flex align="center">
          <Box
            w="20px"
            h="20px"
            borderRadius="full"
            bg={getColour(props.asset.status)}
            boxShadow="md"
          ></Box>
          <Text pl={2}>{props.asset.status}</Text>
          <Spacer />
          <Text>{props.asset.topic}</Text>
        </Flex>

        <Text pt={3} fontWeight="bold" fontSize="2xl">
          {props.asset.manufacturer}
        </Text>
        <Text fontSize="md">{props.asset.model}</Text>

        <Stat py={3}>
          <StatLabel>Utilisation</StatLabel>
          <StatNumber>
            {/* TODO: Move uptime calculation to functions.ts  */}
            {upTimeRounded == 0
              ? 0.0
              : (
                  100 *
                  (upTimeRounded /
                    (upTimeRounded + idleTimeRounded + downTimeRounded))
                ).toFixed(2)}
            %
          </StatNumber>
        </Stat>

        <StatGroup>
          <Stat size="sm">
            <StatLabel>Uptime</StatLabel>
            <StatNumber>
              {formatTimeToHoursAndMinutes(upTimeRounded)}
            </StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel>Idle time</StatLabel>
            <StatNumber>
              {formatTimeToHoursAndMinutes(idleTimeRounded)}
            </StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel>Downtime</StatLabel>
            <StatNumber>
              {formatTimeToHoursAndMinutes(downTimeRounded)}
            </StatNumber>
          </Stat>
        </StatGroup>

        <Button
          border="solid 1px"
          mt={5}
          w="full"
          size="sm"
          onClick={props.onDataViewClick}
        >
          View Data
        </Button>
      </Box>
    </Flex>
  );
};

export default AssetItem;

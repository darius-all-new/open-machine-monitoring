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
  useColorModeValue,
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

  const getBgColor = (status: string) => {
    if (status === "on") {
      return useColorModeValue("green.50", "green.900");
    }
    if (status === "idle") {
      return useColorModeValue("orange.50", "orange.900");
    }
    if (status === "off") {
      return useColorModeValue("red.50", "red.900");
    }
    if (status === "unknown") {
      return useColorModeValue("gray.50", "gray.900");
    }
  };

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBorderColor = useColorModeValue("gray.300", "gray.500");
  const bgColor = useColorModeValue("white", "gray.800");
  const statsBgColor = useColorModeValue("gray.50", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box
      p={6}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
        borderColor: hoverBorderColor,
      }}
      bg={bgColor}
    >
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <Flex
          alignItems="center"
          bg={getBgColor(props.asset.status)}
          py={1}
          px={3}
          borderRadius="full"
          border="1px solid"
          borderColor={getColour(props.asset.status)}
        >
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg={getColour(props.asset.status)}
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              top: "-1px",
              left: "-1px",
              right: "-1px",
              bottom: "-1px",
              borderRadius: "full",
              animation:
                props.asset.status === "on" ? "pulse 2s infinite" : "none",
              background: getColour(props.asset.status),
              opacity: 0.4,
            }}
            sx={{
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 0.4,
                },
                "70%": {
                  transform: "scale(2)",
                  opacity: 0,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 0,
                },
              },
            }}
          />
          <Text
            pl={2}
            fontSize="sm"
            color={getColour(props.asset.status)}
            textTransform="capitalize"
            fontWeight="medium"
          >
            {props.asset.status}
          </Text>
        </Flex>
        <Text fontSize="sm" color="gray.500" fontFamily="mono">
          {props.asset.topic}
        </Text>
      </Flex>

      <Box mb={6}>
        <Text fontWeight="bold" fontSize="2xl" mb={1} lineHeight="1.2">
          {props.asset.manufacturer}
        </Text>
        <Text fontSize="md" color="gray.600">
          {props.asset.model}
        </Text>
      </Box>

      <Box
        mb={6}
        p={4}
        bg={statsBgColor}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <Stat>
          <StatLabel color={labelColor}>Utilisation Rate</StatLabel>
          <StatNumber fontSize="2xl" color={colourScheme.mainButton}>
            {upTimeRounded == 0
              ? "0.00"
              : (
                  100 *
                  (upTimeRounded /
                    (upTimeRounded + idleTimeRounded + downTimeRounded))
                ).toFixed(2)}
            %
          </StatNumber>
        </Stat>
      </Box>

      <StatGroup
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap={4}
        mb={6}
      >
        <Stat size="sm">
          <StatLabel color={labelColor}>Uptime</StatLabel>
          <StatNumber fontSize="md" color={colourScheme.green}>
            {formatTimeToHoursAndMinutes(upTimeRounded)}
          </StatNumber>
        </Stat>
        <Stat size="sm">
          <StatLabel color={labelColor}>Idle time</StatLabel>
          <StatNumber fontSize="md" color={colourScheme.orange}>
            {formatTimeToHoursAndMinutes(idleTimeRounded)}
          </StatNumber>
        </Stat>
        <Stat size="sm">
          <StatLabel color={labelColor}>Downtime</StatLabel>
          <StatNumber fontSize="md" color={colourScheme.red}>
            {formatTimeToHoursAndMinutes(downTimeRounded)}
          </StatNumber>
        </Stat>
      </StatGroup>

      <Button
        w="full"
        size="md"
        colorScheme="blue"
        variant="outline"
        onClick={props.onDataViewClick}
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: "sm",
        }}
        transition="all 0.2s"
      >
        View Details
      </Button>
    </Box>
  );
};

export default AssetItem;

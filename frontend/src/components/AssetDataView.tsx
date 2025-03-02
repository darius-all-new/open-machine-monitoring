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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Box,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Badge,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect } from "react";
import LineGraph from "./LineGraph";
import { Asset, colourScheme } from "../types";
import { FaIndustry, FaCog, FaRss, FaClock } from "react-icons/fa";
import { formatTimeToHoursAndMinutes } from "../functions";

interface Props {
  isOpen: boolean;
  assetOfInterest: Asset;
  onClose: () => void;
}

const AssetDataView = (props: Props) => {
  useEffect(() => {
    {
      props.isOpen && console.log("Data view open.");
    }
  }, [props.isOpen]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const iconColor = useColorModeValue("gray.500", "gray.300");
  const statNumberColor = useColorModeValue("gray.900", "white");

  const getMetricColors = (baseColor: string) => ({
    bg: useColorModeValue(`${baseColor}.50`, `${baseColor}.900`),
    border: useColorModeValue(`${baseColor}.200`, `${baseColor}.700`),
    text: useColorModeValue(`${baseColor}.700`, `${baseColor}.100`),
    subtext: useColorModeValue(`${baseColor}.600`, `${baseColor}.200`),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on":
        return "green";
      case "idle":
        return "orange";
      case "off":
        return "red";
      default:
        return "gray";
    }
  };

  if (!props.isOpen) return null;

  const upTimeRounded = props.assetOfInterest.usage_data.time_on
    ? parseFloat(props.assetOfInterest.usage_data.time_on.toFixed(2))
    : 0.0;
  const idleTimeRounded = props.assetOfInterest.usage_data.time_idle
    ? parseFloat(props.assetOfInterest.usage_data.time_idle.toFixed(2))
    : 0.0;
  const downTimeRounded = props.assetOfInterest.usage_data.time_off
    ? parseFloat(props.assetOfInterest.usage_data.time_off.toFixed(2))
    : 0.0;

  const utilization =
    upTimeRounded === 0
      ? 0
      : (
          100 *
          (upTimeRounded / (upTimeRounded + idleTimeRounded + downTimeRounded))
        ).toFixed(1);

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      size="6xl"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor} borderRadius="xl" overflow="hidden">
        <Box
          bg={colourScheme.mainButton}
          color="white"
          p={6}
          position="relative"
        >
          <ModalHeader p={0}>
            <Flex align="center" gap={3}>
              <Text fontSize="2xl" fontWeight="bold">
                {props.assetOfInterest.manufacturer}{" "}
                {props.assetOfInterest.model}
              </Text>
              <Badge
                colorScheme={getStatusColor(props.assetOfInterest.status)}
                fontSize="0.8em"
                textTransform="capitalize"
                py={1}
                px={3}
                borderRadius="full"
              >
                {props.assetOfInterest.status}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton
            color="white"
            top={4}
            right={4}
            _hover={{ bg: "whiteAlpha.200" }}
          />
        </Box>

        <ModalBody p={6}>
          <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
            <GridItem>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaIndustry} color={iconColor} mr={2} />
                  <StatLabel color={textColor}>Manufacturer</StatLabel>
                </Flex>
                <StatNumber fontSize="lg" color={statNumberColor}>
                  {props.assetOfInterest.manufacturer}
                </StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaCog} color={iconColor} mr={2} />
                  <StatLabel color={textColor}>Model</StatLabel>
                </Flex>
                <StatNumber fontSize="lg" color={statNumberColor}>
                  {props.assetOfInterest.model}
                </StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaRss} color={iconColor} mr={2} />
                  <StatLabel color={textColor}>Topic</StatLabel>
                </Flex>
                <StatNumber
                  fontSize="lg"
                  fontFamily="mono"
                  color={statNumberColor}
                >
                  {props.assetOfInterest.topic}
                </StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaClock} color={iconColor} mr={2} />
                  <StatLabel color={textColor}>Utilisation Rate</StatLabel>
                </Flex>
                <StatNumber fontSize="lg" color={statNumberColor}>
                  {utilization}%
                </StatNumber>
              </Stat>
            </GridItem>
          </Grid>

          <Box mb={6}>
            <Text fontSize="lg" fontWeight="medium" mb={4}>
              Performance Metrics
            </Text>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <GridItem>
                {(() => {
                  const colors = getMetricColors("green");
                  return (
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={colors.bg}
                      border="1px"
                      borderColor={colors.border}
                    >
                      <Stat>
                        <StatLabel color={colors.text}>Uptime</StatLabel>
                        <StatNumber color={colors.text}>
                          {formatTimeToHoursAndMinutes(upTimeRounded)}
                        </StatNumber>
                        <StatHelpText color={colors.subtext}>
                          Active operation time
                        </StatHelpText>
                      </Stat>
                    </Box>
                  );
                })()}
              </GridItem>
              <GridItem>
                {(() => {
                  const colors = getMetricColors("orange");
                  return (
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={colors.bg}
                      border="1px"
                      borderColor={colors.border}
                    >
                      <Stat>
                        <StatLabel color={colors.text}>Idle Time</StatLabel>
                        <StatNumber color={colors.text}>
                          {formatTimeToHoursAndMinutes(idleTimeRounded)}
                        </StatNumber>
                        <StatHelpText color={colors.subtext}>
                          Time in standby mode
                        </StatHelpText>
                      </Stat>
                    </Box>
                  );
                })()}
              </GridItem>
              <GridItem>
                {(() => {
                  const colors = getMetricColors("red");
                  return (
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={colors.bg}
                      border="1px"
                      borderColor={colors.border}
                    >
                      <Stat>
                        <StatLabel color={colors.text}>Downtime</StatLabel>
                        <StatNumber color={colors.text}>
                          {formatTimeToHoursAndMinutes(downTimeRounded)}
                        </StatNumber>
                        <StatHelpText color={colors.subtext}>
                          Time spent offline
                        </StatHelpText>
                      </Stat>
                    </Box>
                  );
                })()}
              </GridItem>
            </Grid>
          </Box>

          <Divider my={6} borderColor={borderColor} />

          <Box>
            <Text fontSize="lg" fontWeight="medium" mb={4}>
              Current Usage Trend
            </Text>
            <Box
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              bg={useColorModeValue("white", "gray.700")}
            >
              <LineGraph id={props.assetOfInterest.id} />
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AssetDataView;

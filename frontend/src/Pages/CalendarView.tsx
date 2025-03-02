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

import React, { useEffect, useState, useMemo } from "react";
import Calendar from "../components/Calendar";
import NavBar from "../components/NavBar";
import { Asset, colourScheme, uptimeBounds } from "../types";
import { fetchAllAssets } from "../functions";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  useColorModeValue,
  Icon,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiSearch, FiCalendar } from "react-icons/fi";

const CalendarView = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState("");

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const searchBgColor = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.700", "white");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (item) =>
          item.manufacturer.toLowerCase().includes(filter.toLowerCase()) ||
          item.model.toLowerCase().includes(filter.toLowerCase())
      ),
    [assets, filter]
  );

  useEffect(() => {
    fetchAllAssets(setAssets);
  }, []);

  return (
    <>
      <NavBar />
      <Box maxW="1400px" mx="auto" px={5} py={8}>
        {/* Header Section */}
        <Box mb={8}>
          <Heading
            size="2xl"
            py={3}
            display="flex"
            alignItems="center"
            gap={4}
            mb={4}
          >
            Year View
            <Icon as={FiCalendar} color={colourScheme.mainButton} boxSize={8} />
          </Heading>
          <Text fontSize="lg" color={textColor}>
            Track asset performance trends over the current year. Monitor uptime
            percentages and identify long-term patterns.
          </Text>
        </Box>

        {/* Search & Legend Section */}
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
          >
            {/* Search */}
            <Box flex="1" maxW="400px">
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search assets..."
                  value={filter}
                  onChange={handleFilterChange}
                  bg={searchBgColor}
                />
              </InputGroup>
            </Box>

            {/* Legend */}
            <Flex gap={6} flexWrap="wrap">
              <Flex align="center">
                <Box
                  w="20px"
                  h="20px"
                  bg={colourScheme.green}
                  mr={2}
                  borderRadius="sm"
                />
                <Text fontSize="sm" color={textColor}>
                  Above {uptimeBounds.good}%
                </Text>
              </Flex>
              <Flex align="center">
                <Box
                  w="20px"
                  h="20px"
                  bg={colourScheme.orange}
                  mr={2}
                  borderRadius="sm"
                />
                <Text fontSize="sm" color={textColor}>
                  {uptimeBounds.bad}% - {uptimeBounds.good}%
                </Text>
              </Flex>
              <Flex align="center">
                <Box
                  w="20px"
                  h="20px"
                  bg={colourScheme.red}
                  mr={2}
                  borderRadius="sm"
                />
                <Text fontSize="sm" color={textColor}>
                  Below {uptimeBounds.bad}%
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>

        {/* Assets Grid */}
        <Grid templateColumns="1fr" gap={4}>
          {filteredAssets.map((asset, index) => (
            <GridItem
              key={index}
              bg={bgColor}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              <Box p={4} borderBottom="1px" borderColor={borderColor}>
                <Text
                  fontSize="lg"
                  fontWeight="medium"
                  color={headingColor}
                  mb={2}
                >
                  {asset.manufacturer} {asset.model}
                </Text>
              </Box>
              <Box p={4}>
                <Calendar searchTerm={filter} asset={asset} />
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default CalendarView;

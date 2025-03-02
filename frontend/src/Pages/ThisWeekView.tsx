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
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  Flex,
  InputGroup,
  InputLeftElement,
  Badge,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { FiSearch, FiCalendar, FiBarChart2 } from "react-icons/fi";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { fetchAllAssets } from "../functions";
import { Asset, colourScheme } from "../types";
import WeeklyViewAssetPanel from "../components/WeeklyViewAssetPanel";
import { useSettings } from "../SettingsContext";

const ThisWeekView = () => {
  // Move all Hook calls to the top
  const { settings } = useSettings();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const weekStartBgColor = useColorModeValue("blue.50", "blue.900");
  const searchBgColor = useColorModeValue("white", "gray.800");
  const tipBgColor = useColorModeValue("gray.50", "gray.700");
  const assetHoverBorderColor = useColorModeValue("blue.200", "blue.500");

  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredAssets = assets.filter(
    (item) =>
      item.manufacturer.toLowerCase().includes(filter.toLowerCase()) ||
      item.model.toLowerCase().includes(filter.toLowerCase())
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
          <Flex align="center" gap={3} mb={2}>
            <Heading
              size="2xl"
              py={3}
              display="flex"
              alignItems="center"
              gap={4}
            >
              Weekly Performance
              <Icon
                as={FiBarChart2}
                color={colourScheme.mainButton}
                boxSize={8}
              />
            </Heading>
          </Flex>
          <Text
            fontSize="lg"
            color={useColorModeValue("gray.600", "gray.200")}
            pb={8}
          >
            Track asset utilisation trends over the current week.
          </Text>
        </Box>

        {/* Week Info & Search Section */}
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
              <Box as={FiCalendar} mr={3} />
              <Text fontWeight="medium">
                Week starts on{" "}
                <Badge colorScheme="blue" fontSize="sm" px={2}>
                  {settings.week_start}
                </Badge>
              </Text>
            </Flex>

            {/* Search Input */}
            <InputGroup maxW={{ base: "100%", md: "400px" }}>
              <InputLeftElement>
                <Box as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                value={filter}
                onChange={handleFilterChange}
                placeholder="Search assets by manufacturer or model..."
                bg={searchBgColor}
                borderColor={borderColor}
                _hover={{ borderColor: "gray.300" }}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
            </InputGroup>
          </Flex>

          {/* Assets Grid */}
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              lg: "repeat(2, 1fr)",
            }}
            gap={6}
          >
            {filteredAssets.map((asset, index) => (
              <GridItem
                key={index}
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
                <WeeklyViewAssetPanel searchTerm={filter} asset={asset} />
              </GridItem>
            ))}
          </Grid>
        </Box>

        {/* Tip Section */}
        <Box p={4} bg={tipBgColor} borderRadius="lg">
          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.200")}>
            Tip: Monitor the weekly performance of your assets to identify
            trends and patterns. Green bars indicate optimal performance, while
            orange and red suggest areas that may need attention.
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default ThisWeekView;

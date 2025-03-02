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

import NavBar from "../components/NavBar";
import {
  Box,
  Heading,
  Text,
  Icon,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiBarChart2 } from "react-icons/fi";
import { colourScheme } from "../types";
import ComparisonChart from "../components/ComparisonChart";

const ComparisonView = () => {
  const iconColor = useColorModeValue(
    colourScheme.mainButton,
    colourScheme.mainButtonDark
  );

  return (
    <>
      <NavBar />
      <Box maxW="1400px" mx="auto" px={5} py={8} bg={useColorModeValue("white", "gray.800")}>
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
              Comparison
              <Icon as={FiBarChart2} color={iconColor} boxSize={8} />
            </Heading>
          </Flex>
          <Text
            fontSize="lg"
            color={useColorModeValue("gray.600", "gray.200")}
            pb={8}
          >
            Compare machine activity of different assets across a specified time
            period.
          </Text>
        </Box>

        {/* Comparison Chart Component */}
        <ComparisonChart />

        {/* Info Section */}
        <Box
          p={4}
          bg={useColorModeValue("gray.50", "gray.700")}
          borderRadius="lg"
          mt={6}
        >
          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
            Tip: Select multiple assets to compare their utilisation patterns
            over a specified time period.
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default ComparisonView;

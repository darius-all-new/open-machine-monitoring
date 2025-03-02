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
  Heading,
  Icon,
  Text,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Button,
  Input,
  Flex,
  VStack,
  SimpleGrid,
  Collapse,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import NavBar from "../components/NavBar";
import { Asset, Downtime, colourScheme } from "../types";
import { FiPieChart, FiFilter } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import { fetchAllAssets, fetchDowntimesByAsset } from "../functions";

interface DowntimeStats {
  name: string;
  value: number;
  duration: number; // Duration in seconds
}

const DowntimeStatsView = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [downtimeData, setDowntimeData] = useState<{
    [key: number]: Downtime[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchAsset, setSearchAsset] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const assetHoverBg = useColorModeValue("gray.100", "gray.600");
  const tooltipBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("gray.700", "white");
  const checkboxBg = useColorModeValue("white", "gray.600");
  const noDataTextColor = useColorModeValue("gray.500", "gray.400");
  const noDataSubTextColor = useColorModeValue("gray.400", "gray.500");
  const iconColor = useColorModeValue(
    colourScheme.mainButton,
    colourScheme.mainButtonDark
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all assets
        await fetchAllAssets(setAssets);

        // Fetch downtime data for each asset
        const assetDowntimes: { [key: number]: Downtime[] } = {};
        for (const asset of assets) {
          const downtimes = await fetchDowntimesByAsset(asset.id);
          assetDowntimes[asset.id] = downtimes;
        }
        setDowntimeData(assetDowntimes);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assets.length]);

  const calculateDowntimeStats = (downtimes: Downtime[]): DowntimeStats[] => {
    // Filter downtimes based on date range if specified
    const filteredDowntimes = downtimes.filter((downtime) => {
      if (!startDate && !endDate) return true;

      const downtimeStart = new Date(downtime.start_time).getTime();
      const downtimeEnd = downtime.end_time
        ? new Date(downtime.end_time).getTime()
        : new Date().getTime();

      const filterStart = startDate ? new Date(startDate).getTime() : -Infinity;
      const filterEnd = endDate ? new Date(endDate).getTime() : Infinity;

      return downtimeStart >= filterStart && downtimeEnd <= filterEnd;
    });

    let plannedDuration = 0;
    let unplannedDuration = 0;

    filteredDowntimes.forEach((downtime) => {
      const startTime = new Date(downtime.start_time).getTime();
      const endTime = downtime.end_time
        ? new Date(downtime.end_time).getTime()
        : new Date().getTime();

      const duration = (endTime - startTime) / 1000; // Convert to seconds

      if (downtime.type === "planned") {
        plannedDuration += duration;
      } else {
        unplannedDuration += duration;
      }
    });

    const totalDuration = plannedDuration + unplannedDuration;

    return [
      {
        name: "Planned",
        value: totalDuration ? (plannedDuration / totalDuration) * 100 : 0,
        duration: plannedDuration,
      },
      {
        name: "Unplanned",
        value: totalDuration ? (unplannedDuration / totalDuration) * 100 : 0,
        duration: unplannedDuration,
      },
    ];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`;
    } else if (startDate) {
      return `Since ${new Date(startDate).toLocaleDateString()}`;
    } else if (endDate) {
      return `Until ${new Date(endDate).toLocaleDateString()}`;
    }
    return "All Time";
  };

  // Colors for planned and unplanned downtime
  const COLORS = ["#4299E1", "#B794F4"]; // blue.400, purple.300

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box bg={tooltipBg} p={2} borderRadius="md" boxShadow="md">
          <Text fontWeight="bold">{data.name}</Text>
          <Text>{`${data.value.toFixed(1)}%`}</Text>
          <Text>{`Duration: ${formatDuration(data.duration)}`}</Text>
        </Box>
      );
    }
    return null;
  };

  const filteredAssets = assets.filter((asset) =>
    (asset.manufacturer + " - " + asset.model)
      .toLowerCase()
      .includes(searchAsset.toLowerCase())
  );

  const clearAllFilters = () => {
    setSearchAsset("");
    setSelectedAssets([]);
    setStartDate("");
    setEndDate("");
  };

  return (
    <>
      <NavBar />
      <Box maxW="1400px" mx="auto" px={5} py={8}>
        <Box mb={8}>
          <Heading
            size="2xl"
            py={3}
            display="flex"
            alignItems="center"
            gap={4}
            mb={2}
          >
            Downtime Stats
            <Icon as={FiPieChart} color={iconColor} boxSize={8} />
          </Heading>
          <Text fontSize="lg" color={textColor} mb={4}>
            Analyse the distribution of planned vs unplanned downtime for each
            asset.
          </Text>
        </Box>

        <Box
          p={4}
          bg={bgColor}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow={bgColor === "white" ? "sm" : "dark-lg"}
        >
          <Flex
            justify="space-between"
            align="center"
            mb={6}
            flexWrap="wrap"
            gap={3}
            pb={4}
            borderBottom="1px"
            borderColor={borderColor}
          >
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              {/* <Icon as={FiFilter} color={iconColor} /> */}
              Downtime Stats
            </Heading>
            <Button
              leftIcon={<FiFilter />}
              mb={4}
              onClick={() => setShowFilters(!showFilters)}
              colorScheme="blue"
              variant="outline"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Flex>

          {/* Collapsible Filters Section */}
          <Collapse in={showFilters} animateOpacity>
            <VStack spacing={4} align="stretch" mb={6}>
              {/* Asset Selection */}
              <Box>
                <Text mb={2} fontWeight="medium">
                  Select Assets:
                </Text>
                <VStack spacing={2} align="stretch">
                  <Input
                    placeholder="Search assets..."
                    value={searchAsset}
                    onChange={(e) => setSearchAsset(e.target.value)}
                    mb={2}
                  />
                  <Box
                    maxH="200px"
                    overflowY="auto"
                    borderWidth={1}
                    borderRadius="md"
                    p={2}
                    borderColor={borderColor}
                  >
                    {filteredAssets.map((asset) => (
                      <Flex
                        key={asset.id}
                        px={2}
                        py={1}
                        alignItems="center"
                        _hover={{ bg: assetHoverBg }}
                        cursor="pointer"
                        onClick={() => {
                          const assetId = asset.id.toString();
                          if (selectedAssets.includes(assetId)) {
                            setSelectedAssets(
                              selectedAssets.filter((id) => id !== assetId)
                            );
                          } else {
                            setSelectedAssets([...selectedAssets, assetId]);
                          }
                        }}
                      >
                        <Box
                          w={4}
                          h={4}
                          borderWidth={1}
                          borderRadius="sm"
                          mr={3}
                          bg={
                            selectedAssets.includes(asset.id.toString())
                              ? "blue.500"
                              : checkboxBg
                          }
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          borderColor={borderColor}
                        >
                          {selectedAssets.includes(asset.id.toString()) && (
                            <Icon as={FaCheck} color="white" fontSize="10px" />
                          )}
                        </Box>
                        <Text color={textColor}>
                          {asset.manufacturer} - {asset.model}
                        </Text>
                      </Flex>
                    ))}
                  </Box>
                </VStack>
              </Box>

              {/* Date Range Selection */}
              <SimpleGrid columns={[1, 2]} spacing={4}>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Start Date:
                  </Text>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    End Date:
                  </Text>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Box>
              </SimpleGrid>
            </VStack>
          </Collapse>

          {(selectedAssets.length > 0 || startDate || endDate) && (
            <Flex mb={4}>
              <Tooltip label="Reset all filters to default">
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
              </Tooltip>
            </Flex>
          )}

          {error && (
            <Alert status="error" mb={6}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" color={colourScheme.mainButton} />
            </Center>
          ) : (
            <Grid templateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]} gap={6}>
              {assets
                .filter(
                  (asset) =>
                    selectedAssets.length === 0 ||
                    selectedAssets.includes(asset.id.toString())
                )
                .map((asset) => {
                  const stats = calculateDowntimeStats(
                    downtimeData[asset.id] || []
                  );
                  const hasData = stats.some((stat) => stat.duration > 0);

                  return (
                    <Box
                      key={asset.id}
                      p={5}
                      borderRadius="lg"
                      border="1px"
                      borderColor={borderColor}
                      bg={bgColor}
                      shadow="sm"
                      _hover={{ shadow: "md" }}
                      transition="all 0.2s"
                    >
                      <Heading size="md" mb={1} color={headingColor}>
                        {asset.manufacturer} {asset.model}
                      </Heading>
                      <Text fontSize="sm" color={noDataTextColor} mb={4}>
                        {formatDateRange()}
                      </Text>
                      {hasData ? (
                        <>
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie
                                data={stats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percent }) =>
                                  `${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                innerRadius={40}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {stats.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                          </ResponsiveContainer>

                          {/* Numerical Data */}
                          <SimpleGrid
                            columns={2}
                            spacing={4}
                            mt={4}
                            pt={4}
                            borderTop="1px"
                            borderColor={borderColor}
                          >
                            {/* Planned Downtime Stats */}
                            <Box>
                              <Text
                                fontSize="sm"
                                color={noDataTextColor}
                                mb={1}
                              >
                                Planned Downtime
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={headingColor}
                              >
                                {formatDuration(stats[0].duration)}
                              </Text>
                              <Text fontSize="sm" color={noDataTextColor}>
                                {stats[0].value.toFixed(1)}% of total
                              </Text>
                            </Box>

                            {/* Unplanned Downtime Stats */}
                            <Box>
                              <Text
                                fontSize="sm"
                                color={noDataTextColor}
                                mb={1}
                              >
                                Unplanned Downtime
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={headingColor}
                              >
                                {formatDuration(stats[1].duration)}
                              </Text>
                              <Text fontSize="sm" color={noDataTextColor}>
                                {stats[1].value.toFixed(1)}% of total
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </>
                      ) : (
                        <Center height="300px">
                          <VStack spacing={2}>
                            <Text fontSize="lg" color={noDataTextColor}>
                              No downtime data to display
                            </Text>
                            <Text fontSize="sm" color={noDataSubTextColor}>
                              {startDate || endDate
                                ? "Try adjusting the date range"
                                : "No records found"}
                            </Text>
                          </VStack>
                        </Center>
                      )}
                    </Box>
                  );
                })}
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
};

export default DowntimeStatsView;

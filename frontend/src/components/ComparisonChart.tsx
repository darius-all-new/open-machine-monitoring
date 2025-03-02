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

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Checkbox,
  Stack,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
} from "@chakra-ui/react";
import { FiSearch, FiBarChart2 } from "react-icons/fi";
import { Asset, UsageRecord } from "../types";
import { calculateSingleUptime, fetchAllAssets } from "../functions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getApiUrl } from "../config";

interface ComparisonDataPoint {
  date: string;
  [key: string]: string | number;
}

// Predefined chart colors
const CHART_COLORS = [
  "#3182CE", // blue
  "#38A169", // green
  "#DD6B20", // orange
  "#E53E3E", // red
  "#805AD5", // purple
  "#D69E2E", // yellow
  "#00B5D8", // cyan
  "#ED64A6", // pink
] as const;

const ComparisonChart = () => {
  // Color mode values - moved outside of useMemo
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const gridColor = useColorModeValue("#E2E8F0", "#4A5568");
  const axisColor = useColorModeValue("#2D3748", "#FFFFFF");
  const tooltipBgColor = useColorModeValue("white", "gray.700");
  const tooltipBorderColor = useColorModeValue("gray.200", "gray.600");
  const checkboxBgColor = useColorModeValue("gray.50", "gray.700");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [comparisonData, setComparisonData] = useState<ComparisonDataPoint[]>([]);

  // Calculate initial dates
  const initialStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  }, []);

  const initialEndDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Use the memoized dates in useState
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);

  // Memoize filtered assets
  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.manufacturer.toLowerCase().includes(filter.toLowerCase()) ||
          asset.model.toLowerCase().includes(filter.toLowerCase())
      ),
    [assets, filter]
  );

  // Memoize asset color getter
  const getAssetColor = useCallback(
    (index: number) => CHART_COLORS[index % CHART_COLORS.length],
    []
  );

  // Memoize record fetching function
  const fetchRecordsForAsset = useCallback(
    async (assetId: number, daysDiff: number) => {
      try {
        const response = await fetch(
          getApiUrl(
            `usage-records-for-asset?asset_id=${assetId}&days=${daysDiff}`
          ),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const newRecords = await response.json();
          setUsageRecords((prevRecords) => [...prevRecords, ...newRecords]);
        }
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    },
    []
  );

  // Memoized handlers
  const handleAssetSelection = useCallback((assetId: number) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  }, []);

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
    },
    []
  );

  // Fetch all assets on component mount
  useEffect(() => {
    fetchAllAssets(setAssets);
  }, []);

  // Fetch usage records when selected assets change or date range changes
  useEffect(() => {
    if (selectedAssetIds.length > 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      setUsageRecords([]); // Clear existing records
      selectedAssetIds.forEach((assetId) =>
        fetchRecordsForAsset(assetId, daysDiff)
      );
    }
  }, [selectedAssetIds, startDate, endDate, fetchRecordsForAsset]);

  // Process usage records into chart data
  useEffect(() => {
    if (usageRecords.length > 0 && selectedAssetIds.length > 0) {
      const dateMap = new Map<string, ComparisonDataPoint>();
      const uniqueDates = [
        ...new Set(usageRecords.map((record) => record.date)),
      ];

      // Initialize dates
      uniqueDates.forEach((date) => dateMap.set(date, { date }));

      // Add data for each asset
      usageRecords.forEach((record) => {
        if (selectedAssetIds.includes(record.asset_id)) {
          const asset = assets.find((a) => a.id === record.asset_id);
          if (asset) {
            const dataPoint = dateMap.get(record.date) || { date: record.date };
            const assetLabel = `${asset.manufacturer} ${asset.model}`;
            dataPoint[assetLabel] = calculateSingleUptime(record);
            dateMap.set(record.date, dataPoint);
          }
        }
      });

      // Sort by date
      setComparisonData(
        Array.from(dateMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
    }
  }, [usageRecords, selectedAssetIds, assets]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={tooltipBgColor}
          p={3}
          borderRadius="md"
          boxShadow="lg"
          border="1px solid"
          borderColor={tooltipBorderColor}
        >
          <Text fontWeight="medium" mb={2}>
            {new Date(label).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
          <Stack spacing={2}>
            {payload.map((entry: any, index: number) => (
              <Flex key={index} align="center">
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="sm"
                  bg={entry.color}
                  mr={2}
                />
                <Text fontWeight="medium">{entry.name}:</Text>
                <Text fontWeight="bold" ml={1}>
                  {Math.round(entry.value)}%
                </Text>
              </Flex>
            ))}
          </Stack>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      p={6}
    >
      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Left Panel: Asset Selection and Date Range */}
        <Box width={{ base: "100%", md: "300px" }}>
          {/* Date Range Selector */}
          <Box mb={4}>
            <Text mb={2} fontSize="sm" color={textColor}>
              Start Date
            </Text>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              mb={3}
            />
            <Text mb={2} fontSize="sm" color={textColor}>
              End Date
            </Text>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split("T")[0]}
            />
          </Box>

          {/* Asset Selection */}
          <Box
            p={4}
            bg={checkboxBgColor}
            borderRadius="md"
            maxH="500px"
            overflowY="auto"
          >
            <Text mb={2} fontWeight="medium">
              Select Assets to Compare
            </Text>
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search assets..."
                value={filter}
                onChange={handleFilterChange}
              />
            </InputGroup>

            <Stack spacing={2}>
              {filteredAssets.map((asset) => (
                <Checkbox
                  key={asset.id}
                  isChecked={selectedAssetIds.includes(asset.id)}
                  onChange={() => handleAssetSelection(asset.id)}
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: hoverBgColor }}
                >
                  <Text fontSize="sm">
                    {asset.manufacturer} {asset.model}
                  </Text>
                </Checkbox>
              ))}
            </Stack>

            {filteredAssets.length === 0 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                No assets found
              </Text>
            )}
          </Box>
        </Box>

        {/* Right Panel: Chart */}
        <Box flex="1">
          {selectedAssetIds.length > 0 ? (
            <Box h="500px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={axisColor}
                    tick={{ fill: axisColor }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fill: axisColor }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    content={CustomTooltip}
                    contentStyle={{
                      backgroundColor: tooltipBgColor,
                      border: `1px solid ${tooltipBorderColor}`,
                    }}
                  />
                  <Legend />
                  {selectedAssetIds.map((assetId, index) => {
                    const asset = assets.find((a) => a.id === assetId);
                    if (asset) {
                      const assetLabel = `${asset.manufacturer} ${asset.model}`;
                      return (
                        <Line
                          key={assetId}
                          type="monotone"
                          dataKey={assetLabel}
                          stroke={getAssetColor(index)}
                          strokeWidth={2}
                          dot={false}
                        />
                      );
                    }
                    return null;
                  })}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Flex
              h="500px"
              align="center"
              justify="center"
              direction="column"
              gap={4}
            >
              <Icon as={FiBarChart2} boxSize={12} color="gray.400" />
              <Text color="gray.500" fontSize="lg" textAlign="center">
                Select one or more assets to compare their utilisation
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ComparisonChart;

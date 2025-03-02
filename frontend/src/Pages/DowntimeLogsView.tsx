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

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Select,
  SimpleGrid,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Icon,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Input,
  Collapse,
  Tag,
  TagLabel,
  TagCloseButton,
  VStack,
  Tooltip,
} from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import { Asset, Downtime, colourScheme } from "../types";
import { fetchAllAssets } from "../functions";
import { getApiUrl } from "../config";
import {
  FaClipboardList,
  FaFilter,
  FaEllipsisV,
  FaChevronDown,
  FaChevronUp,
  FaTools,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaCheck,
  FaSortUp,
  FaSortDown,
  FaAngleLeft,
  FaAngleRight,
  FaFileExport,
} from "react-icons/fa";
import DowntimeDetailsModal from "../components/DowntimeDetailsModal";

// Expandable Text component for descriptions
const ExpandableText = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150; // Maximum characters to show when collapsed

  // If text is shorter than maxLength, just show it
  if (text.length <= maxLength) {
    return (
      <Text fontSize="sm" pr={4}>
        {text}
      </Text>
    );
  }

  return (
    <Box pr={4}>
      <Text fontSize="sm">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </Text>
      <Button
        size="xs"
        mt={1}
        rightIcon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        colorScheme="blue"
      >
        {isExpanded ? "Show less" : "Show more"}
      </Button>
    </Box>
  );
};

const DowntimeLogsView: React.FC = () => {
  // State hooks - grouped together for clarity
  const [assets, setAssets] = useState<Asset[]>([]);
  const [downtimes, setDowntimes] = useState<Downtime[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDowntime, setSelectedDowntime] = useState<Downtime | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchAsset, setSearchAsset] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [editModalData, setEditModalData] = useState<{
    assetId: number;
    assetName: string;
    startTime: string;
    endTime?: string;
    downtimeId?: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // UI hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  // Color mode values - all collected at the top level
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const mainButtonColor = useColorModeValue(
    colourScheme.mainButton,
    colourScheme.mainButtonDark
  );
  const textColor = useColorModeValue("gray.600", "gray.200");
  const tableBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");
  const tableHoverBg = useColorModeValue("gray.50", "gray.600");
  const grayTextColor = useColorModeValue("gray.500", "gray.400");
  const grayTextColor2 = useColorModeValue("gray.600", "gray.400");
  const redTextColor = useColorModeValue("red.500", "red.300");
  const assetHoverBg = useColorModeValue("blue.50", "blue.900");
  const iconColor = useColorModeValue(
    colourScheme.mainButton,
    colourScheme.mainButtonDark
  );

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAssets(value === "all" ? [] : [value]);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as "all" | "planned" | "unplanned");
  };

  useEffect(() => {
    fetchAllAssets(setAssets);
    fetchDowntimes();
  }, []);

  const fetchDowntimes = async () => {
    setIsLoading(true);
    try {
      // Fetch all assets first to ensure we have the complete list
      const response = await fetch(getApiUrl("get-downtimes"));
      if (response.ok) {
        const data = await response.json();
        setDowntimes(data);
      } else {
        console.error("Error fetching downtimes:", response.status);
      }
    } catch (error) {
      console.error("Error fetching downtimes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (downtime: Downtime) => {
    setSelectedDowntime(downtime);
    onOpen();
  };

  const handleDowntimeUpdated = () => {
    fetchDowntimes();
  };

  const handleDeleteDowntime = async (downtimeId: number) => {
    try {
      const response = await fetch(getApiUrl(`delete-downtime/${downtimeId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the list after deletion
        fetchDowntimes();
      } else {
        console.error("Error deleting downtime:", response.status);
      }
    } catch (error) {
      console.error("Error deleting downtime:", error);
    }
  };

  // Filter, sort, and paginate downtimes
  const paginatedDowntimes = useMemo(() => {
    const filtered = downtimes.filter((downtime) => {
      const matchesAssets =
        selectedAssets.length === 0 ||
        selectedAssets.includes(downtime.asset_id.toString());
      const matchesType =
        selectedType === "all" || downtime.type === selectedType;

      const downtimeDate = new Date(downtime.start_time);
      const matchesDateRange =
        (!startDate || downtimeDate >= new Date(startDate)) &&
        (!endDate || downtimeDate <= new Date(endDate));

      return matchesAssets && matchesType && matchesDateRange;
    });

    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.start_time).getTime();
      const dateB = new Date(b.start_time).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    // Calculate pagination
    const totalPages = Math.ceil(sorted.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      downtimes: sorted.slice(startIndex, endIndex),
      totalItems: sorted.length,
      totalPages,
    };
  }, [
    downtimes,
    selectedAssets,
    selectedType,
    startDate,
    endDate,
    sortOrder,
    currentPage,
    pageSize,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAssets, selectedType, startDate, endDate, sortOrder, pageSize]);

  // Format date and time for display
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  // Format date for display in the list view
  const formatDateForList = (dateTimeString: string) => {
    const date = new Date(dateTimeString);

    // Format date as MMM DD, YYYY (e.g., Mar 01, 2025)
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    // Format time as HH:MM AM/PM (e.g., 2:42 PM)
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return {
      date: date.toLocaleDateString(undefined, dateOptions),
      time: date.toLocaleTimeString(undefined, timeOptions),
    };
  };

  const getAssetName = (assetId: number) => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? `${asset.manufacturer} ${asset.model}` : `Asset #${assetId}`;
  };

  const handleEditDowntime = (downtime: Downtime) => {
    const asset = assets.find((a) => a.id === downtime.asset_id);
    setEditModalData({
      assetId: downtime.asset_id,
      assetName: asset
        ? `${asset.manufacturer} ${asset.model}`
        : "Unknown Asset",
      startTime: downtime.start_time,
      endTime: downtime.end_time,
      downtimeId: downtime.id,
    });
    onEditModalOpen();
  };

  const filteredAssets = assets.filter(
    (asset) =>
      (asset.manufacturer?.toLowerCase() || "").includes(
        searchAsset.toLowerCase()
      ) ||
      (asset.model?.toLowerCase() || "").includes(searchAsset.toLowerCase())
  );

  const removeAsset = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter((id) => id !== assetId));
  };

  const getSelectedAssetNames = () => {
    return selectedAssets
      .map((id) => {
        const asset = assets.find((a) => a.id.toString() === id);
        return asset ? `${asset.manufacturer} - ${asset.model}` : "";
      })
      .filter(Boolean);
  };

  // Function to export filtered downtimes to CSV
  const exportToCSV = () => {
    // Get all filtered downtimes (not just current page)
    const filtered = downtimes.filter((downtime) => {
      const matchesAssets =
        selectedAssets.length === 0 ||
        selectedAssets.includes(downtime.asset_id.toString());
      const matchesType =
        selectedType === "all" || downtime.type === selectedType;

      const downtimeDate = new Date(downtime.start_time);
      const matchesDateRange =
        (!startDate || downtimeDate >= new Date(startDate)) &&
        (!endDate || downtimeDate <= new Date(endDate));

      return matchesAssets && matchesType && matchesDateRange;
    });

    // Sort the data
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.start_time).getTime();
      const dateB = new Date(b.start_time).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    // Prepare CSV data
    const csvRows = [];

    // Add headers
    csvRows.push(
      [
        "Title",
        "Description",
        "Type",
        "Asset Manufacturer",
        "Asset Model",
        "Start Date",
        "Start Time",
        "End Date",
        "End Time",
        "Duration (hours)",
      ].join(",")
    );

    // Add data rows
    sorted.forEach((downtime) => {
      const asset = assets.find((a) => a.id === downtime.asset_id);
      const startDate = new Date(downtime.start_time);
      const endDate = downtime.end_time ? new Date(downtime.end_time) : null;

      // Calculate duration in hours if end time exists
      let duration = "";
      if (endDate) {
        const durationHours =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        duration = durationHours.toFixed(2);
      }

      const row = [
        `"${downtime.title.replace(/"/g, '""')}"`, // Escape quotes in title
        `"${downtime.description.replace(/"/g, '""')}"`, // Escape quotes in description
        downtime.type,
        asset?.manufacturer || "Unknown",
        asset?.model || "Unknown",
        formatDateForList(downtime.start_time).date,
        formatDateForList(downtime.start_time).time,
        endDate ? formatDateForList(downtime.end_time!).date : "Ongoing",
        endDate ? formatDateForList(downtime.end_time!).time : "",
        duration,
      ].join(",");

      csvRows.push(row);
    });

    // Create and download the CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `downtime_events_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedAssets([]);
    setSelectedType("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setSearchAsset("");
  };

  // Calculate downtime statistics
  const downtimeStats = useMemo(() => {
    const plannedDowntimes = downtimes.filter((d) => d.type === "planned");
    const unplannedDowntimes = downtimes.filter((d) => d.type === "unplanned");

    const calculateTotalHours = (downtimeList: Downtime[]) => {
      return downtimeList.reduce((total, d) => {
        if (!d.end_time) return total; // Skip ongoing downtimes
        const start = new Date(d.start_time);
        const end = new Date(d.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
    };

    return {
      planned: {
        count: plannedDowntimes.length,
        totalHours: calculateTotalHours(plannedDowntimes),
      },
      unplanned: {
        count: unplannedDowntimes.length,
        totalHours: calculateTotalHours(unplannedDowntimes),
      },
    };
  }, [downtimes]);

  return (
    <Box>
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
            Downtime Logs
            <Icon as={FaClipboardList} color={iconColor} boxSize={8} />
          </Heading>
          <Text fontSize="lg" color={textColor} mb={4}>
            Track and manage downtime events for all assets. View historical
            downtime records and filter by asset or type (unplanned and
            planned).
          </Text>
        </Box>

        {/* Downtime Statistics Cards */}
        <SimpleGrid columns={[1, null, 2]} spacing={6} mb={6}>
          <Box
            p={6}
            bg={bgColor}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Flex align="center" mb={4}>
              <Icon as={FaTools} color="blue.500" boxSize={5} mr={2} />
              <Heading size="md">Planned Downtime</Heading>
            </Flex>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontSize="sm" color={grayTextColor}>
                  Total Events
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {downtimeStats.planned.count}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color={grayTextColor}>
                  Total Hours
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {downtimeStats.planned.totalHours.toFixed(1)}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          <Box
            p={6}
            bg={bgColor}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Flex align="center" mb={4}>
              <Icon
                as={FaExclamationTriangle}
                color="red.500"
                boxSize={5}
                mr={2}
              />
              <Heading size="md">Unplanned Downtime</Heading>
            </Flex>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontSize="sm" color={grayTextColor}>
                  Total Events
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {downtimeStats.unplanned.count}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color={grayTextColor}>
                  Total Hours
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {downtimeStats.unplanned.totalHours.toFixed(1)}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </SimpleGrid>

        <Box
          p={4}
          bg={bgColor}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow={tableBg === "white" ? "sm" : "dark-lg"}
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
              {/* <Icon
                as={FaFilter}
                color={mainButtonColor}
              /> */}
              Log of Downtime Events
            </Heading>
            <Button
              leftIcon={<FaFilter />}
              mb={4}
              onClick={() => setShowFilters(!showFilters)}
              colorScheme="blue"
              variant="outline"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Flex>

          {/* Selected Assets Tags */}
          {selectedAssets.length > 0 && (
            <Flex wrap="wrap" gap={2} mb={4}>
              {getSelectedAssetNames().map((name, index) => (
                <Tag
                  key={selectedAssets[index]}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="blue"
                >
                  <TagLabel>{name}</TagLabel>
                  <TagCloseButton
                    onClick={() => removeAsset(selectedAssets[index])}
                  />
                </Tag>
              ))}
            </Flex>
          )}

          {/* Collapsible Filters Section */}
          <Collapse in={showFilters} animateOpacity>
            <Box mb={6} p={4} bg={bgColor} borderRadius="md" boxShadow="sm">
              <VStack spacing={4} align="stretch">
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
                                : "white"
                            }
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {selectedAssets.includes(asset.id.toString()) && (
                              <Icon
                                as={FaCheck}
                                color="white"
                                fontSize="10px"
                              />
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

                {/* Type Selection */}
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Type:
                  </Text>
                  <Select value={selectedType} onChange={handleTypeChange}>
                    <option value="all">All Types</option>
                    <option value="planned">Planned</option>
                    <option value="unplanned">Unplanned</option>
                  </Select>
                </Box>
              </VStack>
            </Box>
          </Collapse>

          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <HStack spacing={2}>
              {(selectedAssets.length > 0 ||
                selectedType !== "all" ||
                startDate ||
                endDate) && (
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
              )}
            </HStack>
            <HStack spacing={2}>
              {paginatedDowntimes.totalItems > 0 && (
                <Tooltip label="Export filtered events to CSV">
                  <Button
                    leftIcon={<Icon as={FaFileExport} />}
                    onClick={exportToCSV}
                    colorScheme="blue"
                    size="sm"
                  >
                    Export to CSV
                  </Button>
                </Tooltip>
              )}
            </HStack>
          </Flex>

          {isLoading ? (
            <Center p={8}>
              <Spinner size="xl" />
            </Center>
          ) : paginatedDowntimes.downtimes.length === 0 ? (
            <Alert
              status="info"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="lg"
              mb={4}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                No downtime events found
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                {selectedAssets.length > 0 || selectedType !== "all"
                  ? "Try changing your filter settings to see more results."
                  : "There are no downtime events recorded in the system yet."}
              </AlertDescription>
            </Alert>
          ) : (
            <Box
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="sm"
              bg={tableBg}
            >
              {/* Table Header */}
              <Flex
                p={4}
                bg={tableHeaderBg}
                borderBottomWidth="1px"
                fontWeight="bold"
              >
                <Box flex="2">Event</Box>
                <Box flex="1">Asset</Box>
                <Box flex="1.5">
                  <Flex
                    alignItems="center"
                    cursor="pointer"
                    onClick={() =>
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                    }
                    _hover={{ color: "blue.500" }}
                  >
                    <Text>Time Period</Text>
                    <Icon
                      as={sortOrder === "desc" ? FaSortDown : FaSortUp}
                      ml={2}
                      color="blue.500"
                    />
                  </Flex>
                </Box>
                <Box flex="0.5" textAlign="right">
                  Actions
                </Box>
              </Flex>

              {/* Table Rows */}
              {paginatedDowntimes.downtimes.map((downtime) => {
                const asset = assets.find((a) => a.id === downtime.asset_id);

                return (
                  <Flex
                    key={downtime.id}
                    p={4}
                    borderBottomWidth="1px"
                    borderColor={tableBorderColor}
                    alignItems="center"
                    _hover={{ bg: tableHoverBg }}
                  >
                    {/* Title and Type */}
                    <Box flex="2">
                      <Flex alignItems="center" mb={1}>
                        <Heading size="sm" mr={2}>
                          {downtime.title}
                        </Heading>
                        <Badge
                          colorScheme={
                            downtime.type === "planned" ? "blue" : "red"
                          }
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          fontSize="xs"
                        >
                          <Icon
                            as={
                              downtime.type === "planned"
                                ? FaTools
                                : FaExclamationTriangle
                            }
                            mr={1}
                            fontSize="xs"
                          />
                          {downtime.type}
                        </Badge>
                      </Flex>
                      <Box mt={1}>
                        <ExpandableText text={downtime.description} />
                      </Box>
                    </Box>

                    {/* Asset Info */}
                    <Box flex="1">
                      <Text fontWeight="medium">
                        {asset?.manufacturer || "Unknown"}
                      </Text>
                      <Text fontSize="sm">{asset?.model || "Unknown"}</Text>
                    </Box>

                    {/* Time Period */}
                    <Box flex="1.5">
                      <Flex direction="column">
                        <Box mb={2}>
                          <Text fontSize="xs" color={grayTextColor}>
                            Start
                          </Text>
                          <Flex alignItems="center">
                            <Text fontWeight="medium">
                              {formatDateForList(downtime.start_time).date}
                            </Text>
                            <Text fontSize="sm" ml={2} color={grayTextColor2}>
                              {formatDateForList(downtime.start_time).time}
                            </Text>
                          </Flex>
                        </Box>

                        <Box>
                          <Text fontSize="xs" color={grayTextColor}>
                            End
                          </Text>
                          {downtime.end_time ? (
                            <Flex alignItems="center">
                              <Text fontWeight="medium">
                                {formatDateForList(downtime.end_time).date}
                              </Text>
                              <Text fontSize="sm" ml={2} color={grayTextColor2}>
                                {formatDateForList(downtime.end_time).time}
                              </Text>
                            </Flex>
                          ) : (
                            <Badge colorScheme="yellow" fontSize="xs">
                              Ongoing
                            </Badge>
                          )}
                        </Box>
                      </Flex>
                    </Box>

                    {/* Actions */}
                    <Box flex="0.5" textAlign="right">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FaEllipsisV />}
                          variant="ghost"
                          size="sm"
                          aria-label="Options"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FaInfoCircle />}
                            onClick={() => handleViewDetails(downtime)}
                          >
                            More Info
                          </MenuItem>
                          <MenuItem
                            icon={<FaEdit />}
                            onClick={() => handleEditDowntime(downtime)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<FaTrash />}
                            color={redTextColor}
                            onClick={() => handleDeleteDowntime(downtime.id)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  </Flex>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {paginatedDowntimes.totalItems > 0 && (
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt={4}
            p={4}
            bg={bgColor}
            borderRadius="md"
          >
            <HStack spacing={4}>
              <Text fontSize="sm">Items per page:</Text>
              <Select
                size="sm"
                width="70px"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </Select>
              <Text fontSize="sm">
                {`${Math.min(
                  (currentPage - 1) * pageSize + 1,
                  paginatedDowntimes.totalItems
                )}-${Math.min(
                  currentPage * pageSize,
                  paginatedDowntimes.totalItems
                )} of ${paginatedDowntimes.totalItems}`}
              </Text>
            </HStack>

            <HStack spacing={2}>
              <IconButton
                aria-label="Previous page"
                icon={<Icon as={FaAngleLeft} />}
                size="sm"
                onClick={() => setCurrentPage((curr) => curr - 1)}
                isDisabled={currentPage === 1}
              />
              <HStack spacing={1}>
                {[...Array(paginatedDowntimes.totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    variant={currentPage === i + 1 ? "solid" : "ghost"}
                    colorScheme={currentPage === i + 1 ? "blue" : "gray"}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </HStack>
              <IconButton
                aria-label="Next page"
                icon={<Icon as={FaAngleRight} />}
                size="sm"
                onClick={() => setCurrentPage((curr) => curr + 1)}
                isDisabled={currentPage >= paginatedDowntimes.totalPages}
              />
            </HStack>
          </Flex>
        )}
      </Box>

      {/* Modal for showing downtime details */}
      {selectedDowntime && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Flex alignItems="center" gap={2}>
                {selectedDowntime.title}
                <Badge
                  colorScheme={
                    selectedDowntime.type === "planned" ? "blue" : "red"
                  }
                  ml={2}
                >
                  {selectedDowntime.type}
                </Badge>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Box mb={4}>
                <Text fontWeight="bold" mb={1}>
                  Asset
                </Text>
                {(() => {
                  const asset = assets.find(
                    (a) => a.id === selectedDowntime.asset_id
                  );
                  return (
                    <Text>
                      {asset
                        ? `${asset.manufacturer || "Unknown"} ${
                            asset.model || ""
                          }`
                        : "Unknown Asset"}
                    </Text>
                  );
                })()}
              </Box>

              <Box mb={4}>
                <Text fontWeight="bold" mb={1}>
                  Time Period
                </Text>
                <Text>
                  Start: {formatDateTime(selectedDowntime.start_time)}
                </Text>
                <Text>
                  End:{" "}
                  {selectedDowntime.end_time
                    ? formatDateTime(selectedDowntime.end_time)
                    : "Ongoing"}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>
                  Description
                </Text>
                <Box mt={1}>
                  <ExpandableText text={selectedDowntime.description} />
                </Box>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Downtime Modal */}
      {editModalData && (
        <DowntimeDetailsModal
          isOpen={isEditModalOpen}
          onClose={onEditModalClose}
          assetId={editModalData.assetId}
          assetName={editModalData.assetName}
          startTime={editModalData.startTime}
          endTime={editModalData.endTime}
          downtimeId={editModalData.downtimeId}
          onDowntimeUpdated={handleDowntimeUpdated}
        />
      )}
    </Box>
  );
};

export default DowntimeLogsView;

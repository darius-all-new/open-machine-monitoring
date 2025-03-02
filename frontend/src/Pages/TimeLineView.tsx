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

import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import TimeBarPanel from "../components/TimeBarPanel";
import { Asset, Range, colourScheme } from "../types";
import {
  fetchAllAssets,
  updateAssetStatuses,
  findDowntimeForTimeRange,
} from "../functions";
import { useSettings } from "../SettingsContext";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearchMinus,
  FaSearchPlus,
  FaUndo,
  FaClock,
} from "react-icons/fa";
import DowntimeDetailsModal from "../components/DowntimeDetailsModal";

const TimeLineView = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const { settings } = useSettings();
  const [startHour, setStartHour] = useState(settings.day_start_hour);
  const [endHour, setEndHour] = useState(settings.day_end_hour);
  const today = new Date();

  // Update timeline bounds when settings change
  useEffect(() => {
    setStartHour(settings.day_start_hour);
    setEndHour(settings.day_end_hour);
  }, [settings]);

  // State for downtime modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDowntime, setSelectedDowntime] = useState<{
    assetId: number;
    assetName: string;
    startTime: string;
    endTime: string;
    downtimeId?: number;
  } | null>(null);

  useEffect(() => {
    fetchAllAssets(setAssets);
    updateAssetStatuses();

    // TODO: Allow users to change polling rate?
    const fetchAssetsInterval = setInterval(fetchAllAssets, 5000, setAssets);
    const updateStatusesInterval = setInterval(updateAssetStatuses, 5000);

    return () => {
      clearInterval(fetchAssetsInterval);
      clearInterval(updateStatusesInterval);
    };
  }, []);

  const minHour = settings.day_start_hour;
  const maxHour = settings.day_end_hour;

  const clamp = (num: number, min: number, max: number) =>
    Math.min(Math.max(num, min), max);

  const moveTimeLineLeft = () => {
    setStartHour(clamp(startHour - 1, minHour, maxHour));
    setEndHour(clamp(endHour - 1, minHour, maxHour));
  };
  const moveTimeLineRight = () => {
    setStartHour(clamp(startHour + 1, minHour, maxHour));
    setEndHour(clamp(endHour + 1, minHour, maxHour));
  };

  const zoomOut = () => {
    setStartHour(clamp(startHour - 1, minHour, maxHour));
    setEndHour(clamp(endHour + 1, minHour, maxHour));
  };

  const zoomIn = () => {
    if (endHour - startHour <= 2) {
      return;
    }
    setStartHour(clamp(startHour + 1, minHour, maxHour));
    setEndHour(clamp(endHour - 1, minHour, maxHour));
  };

  const resetView = () => {
    setStartHour(settings.day_start_hour);
    setEndHour(settings.day_end_hour);
  };

  const handleDowntimeClick = async (
    activity: Range,
    assetId: number,
    assetName: string
  ) => {
    // Check if there's an existing downtime event for this time period
    const existingDowntime = await findDowntimeForTimeRange(
      assetId,
      activity.time_begin,
      activity.time_end
    );

    setSelectedDowntime({
      assetId,
      assetName,
      startTime: activity.time_begin,
      endTime: activity.time_end,
      downtimeId: existingDowntime?.id,
    });

    onOpen();
  };

  const handleDowntimeUpdated = () => {
    // Refresh the assets data to reflect any changes
    fetchAllAssets(setAssets);

    // Clear the selected downtime to prevent trying to fetch a deleted downtime
    setSelectedDowntime(null);
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const iconColor = useColorModeValue(
    colourScheme.mainButton,
    colourScheme.mainButtonDark
  );

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
            Timeline View
            <Icon as={FaClock} color={iconColor} boxSize={8} />
          </Heading>
          <Text
            fontSize="lg"
            color={useColorModeValue("gray.600", "gray.200")}
            mb={4}
          >
            Monitor asset activity over the current day. Track patterns and
            identify periods of activity, idle time, and downtime.
          </Text>
        </Box>

        <Box
          p={4}
          bg={bgColor}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow={useColorModeValue("sm", "dark-lg")}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={3}>
              <Text
                fontSize="lg"
                fontWeight="medium"
                color={useColorModeValue("gray.700", "white")}
              >
                Activity Timeline
              </Text>
              <Text color={useColorModeValue("gray.600", "gray.200")}>
                {today.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Flex>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Tooltip label="Move timeline left">
                <Button onClick={moveTimeLineLeft}>
                  <Icon as={FaChevronLeft} />
                </Button>
              </Tooltip>
              <Tooltip label="Move timeline right">
                <Button onClick={moveTimeLineRight}>
                  <Icon as={FaChevronRight} />
                </Button>
              </Tooltip>
              <Tooltip label="Zoom out">
                <Button onClick={zoomOut}>
                  <Icon as={FaSearchMinus} />
                </Button>
              </Tooltip>
              <Tooltip label="Zoom in">
                <Button onClick={zoomIn}>
                  <Icon as={FaSearchPlus} />
                </Button>
              </Tooltip>
              <Tooltip label="Reset to full day view">
                <Button onClick={resetView}>
                  <Icon as={FaUndo} />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Flex>

          <Box>
            <Grid gap={4}>
              {assets.map((asset, key) => (
                <TimeBarPanel
                  startHour={startHour}
                  endHour={endHour}
                  key={key}
                  asset={asset}
                  onDowntimeClick={handleDowntimeClick}
                />
              ))}
            </Grid>
          </Box>
        </Box>

        <Box
          p={4}
          bg={useColorModeValue("gray.50", "gray.700")}
          borderRadius="lg"
          boxShadow={useColorModeValue("sm", "dark-lg")}
        >
          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.200")}>
            Tip: Use the timeline controls to navigate through the day. Zoom in
            for detailed views of specific time periods, or zoom out to see the
            full day's activity at once. Click on red downtime regions to create
            or edit downtime events.
          </Text>
        </Box>
      </Box>

      {selectedDowntime && (
        <DowntimeDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          assetId={selectedDowntime.assetId}
          assetName={selectedDowntime.assetName}
          startTime={selectedDowntime.startTime}
          endTime={selectedDowntime.endTime}
          downtimeId={selectedDowntime.downtimeId}
          onDowntimeUpdated={handleDowntimeUpdated}
        />
      )}
    </>
  );
};

export default TimeLineView;

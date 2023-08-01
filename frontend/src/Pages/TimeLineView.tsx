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
import { Asset } from "../types";
import { fetchAllAssets, updateAssetStatuses } from "../functions";
import { Box, Button, Center, Heading, Text } from "@chakra-ui/react";

const TimeLineView = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(24);
  const today = new Date();

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

  const minHour = 0;
  const maxHour = 24;

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
    setStartHour(0);
    setEndHour(24);
  };

  return (
    <>
      <NavBar />

      <Box p={5}>
        <Heading py={3}>Timeline View</Heading>
        <Text py={5}>
          This is the timeline view. Here you can see an activity timeline for
          each asset over the current day
        </Text>
        <Text py={5}>Showing activity for: {today.toLocaleDateString()}</Text>
      </Box>

      {assets.map((asset, key) => {
        return (
          <TimeBarPanel
            startHour={startHour}
            endHour={endHour}
            key={key}
            asset={asset}
          />
        );
      })}
      <Center py={3}>
        <Button mx={1} onClick={moveTimeLineLeft}>
          {"<"}
        </Button>
        <Button mx={1} onClick={moveTimeLineRight}>
          {">"}
        </Button>
        <Button mx={1} onClick={zoomOut}>
          {"-"}
        </Button>
        <Button mx={1} onClick={zoomIn}>
          {"+"}
        </Button>
        <Button mx={1} onClick={resetView}>
          Reset View
        </Button>
      </Center>
    </>
  );
};

export default TimeLineView;

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

import { Box, Grid, GridItem, Heading, Input, Text } from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { fetchAllAssets } from "../functions";
import { Asset } from "../types";
import WeeklyViewAssetPanel from "../components/WeeklyViewAssetPanel";
import { useSettings } from "../SettingsContext";

const ThisWeekView = () => {
  const { settings, updateSettings } = useSettings();
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
      <Box p={5}>
        <Heading py={3}>This Week</Heading>
        <Text py={5}>
          This is the current week's view. Here you can see how the % uptime of
          each asset has changed since the beginning of the week (set in the
          settings panel)
        </Text>
        <Text>Weeks start on: {settings.week_start}</Text>
        <Input
          border="solid 1px"
          my={5}
          size="lg"
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter Assets"
        />
      </Box>

      <Box w="100%">
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(2, 1fr)",
          }}
          gap={4}
        >
          {filteredAssets.map((a, k) => {
            return (
              <GridItem mx={3} border="solid 1px" borderRadius="5px" key={k}>
                <WeeklyViewAssetPanel searchTerm={filter} key={k} asset={a} />
              </GridItem>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

export default ThisWeekView;

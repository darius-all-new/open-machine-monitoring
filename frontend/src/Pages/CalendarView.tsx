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

import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar";
import NavBar from "../components/NavBar";
import { Asset, colourScheme, uptimeBounds } from "../types";
import { fetchAllAssets } from "../functions";
import {
  Box,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";

const CalendarView = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredAssets = assets.filter((item) =>
    item.manufacturer.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    fetchAllAssets(setAssets);
  }, []);

  return (
    <>
      <NavBar />
      <Box p={5}>
        <Heading py={3}>Year View</Heading>
        <Text py={5}>
          This is the year view. Here you can see how the % uptime of each asset
          has changed since the beginning of the year
        </Text>

        <Input
          border="solid 1px"
          my={5}
          size="lg"
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter Assets"
        />

        <Center>
          <Flex align="center" justify="space-between" maxWidth="500px">
            <Box display="flex" alignItems="center">
              <Box w="20px" h="20px" bg={colourScheme.green} mr={3}></Box>
              <Text fontSize="sm" pr={3}>
                {`above ${uptimeBounds.good}%`}
              </Text>
            </Box>
            <Box display="flex" alignItems="center">
              <Box w="20px" h="20px" bg={colourScheme.orange} mr={3}></Box>
              <Text fontSize="sm" pr={3}>
                {`between ${uptimeBounds.bad}% and ${uptimeBounds.good}%`}
              </Text>
            </Box>
            <Box display="flex" alignItems="center">
              <Box w="20px" h="20px" bg={colourScheme.red} mr={3}></Box>
              <Text fontSize="sm" pr={3}>
                {`below ${uptimeBounds.bad}%`}
              </Text>
            </Box>
          </Flex>
        </Center>
      </Box>

      <Box w="100%">
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(1, 1fr)",
            lg: "repeat(1, 1fr)",
          }}
          gap={4}
        >
          {filteredAssets.map((a, k) => {
            return (
              <GridItem mx={3} border="solid 1px" borderRadius="5px" key={k}>
                <Text p={5}>
                  {a.manufacturer} {a.model}
                </Text>

                <Center py={5}>
                  <Calendar searchTerm={filter} key={k} asset={a} />
                </Center>
              </GridItem>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

export default CalendarView;

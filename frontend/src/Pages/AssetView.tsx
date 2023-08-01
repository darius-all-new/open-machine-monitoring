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
  Button,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import AssetItem from "../components/AssetItem";
import NavBar from "../components/NavBar";
import CreateAssetPanel from "../components/CreateAssetPanel";
import { Asset, colourScheme } from "../types";
import AssetDataView from "../components/AssetDataView";
import {
  createNewAsset,
  fetchAllAssets,
  updateAssetStatuses,
  updateMetrics,
} from "../functions";

const AssetView = () => {
  const [filter, setFilter] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);

  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const [assetIdOfInterest, setAssetIdOfInterest] = useState(0);

  const [isAddNewOpen, setIsAddNewOpen] = useState(false);

  useEffect(() => {
    fetchAllAssets(setAssets);
    updateMetrics();
    updateAssetStatuses();

    // TODO: Add adjustable polling
    const intervalId = setInterval(fetchAllAssets, 5000, setAssets);
    const intervalMetricsUpdate = setInterval(updateMetrics, 60000);
    const intervalStatusUpdate = setInterval(updateAssetStatuses, 5000);

    return () => {
      clearInterval(intervalId);
      clearInterval(intervalMetricsUpdate);
      clearInterval(intervalStatusUpdate);
    };
  }, []);

  // Data view for each asset:
  const handleDataViewClick = (id: number) => {
    setAssetIdOfInterest(id);
    setIsDataViewOpen(true);
  };

  const handleAssetViewClose = () => {
    setIsDataViewOpen(false);
  };

  // Search filter for the asset list
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredAssets = assets.filter(
    (item) =>
      item.manufacturer.toLowerCase().includes(filter.toLowerCase()) ||
      item.model.toLowerCase().includes(filter.toLowerCase())
  );

  // For creating a new asset connection
  const handleAddNew = () => {
    setIsAddNewOpen(true);
  };

  const handleClose = () => {
    setIsAddNewOpen(false);
  };

  const toast = useToast();

  const handleAdd = async (
    manufacturer: string,
    model: string,
    topic: string
  ) => {
    if (!manufacturer || !model || !topic) {
      console.error("Please fill out all fields");
      toast({
        title: "Please fill out all the fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await createNewAsset(manufacturer, model, topic);
      if (response.status == "ok") {
        console.log("success");
        fetchAllAssets(setAssets);
        toast({
          title: "Asset successfully created!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (response.status == "error") {
        toast({
          title: "There was a problem creating the asset. Check the backend.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title:
          "There was a problem creating the asset. Please check the details and try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const assetOfInterest = assets.find((a) => a.id === assetIdOfInterest);

  return (
    <>
      <NavBar />
      <Box p={5}>
        <Heading py={3}>Assets</Heading>
        <Text py={5}>
          This is the main asset view. Here you can see all connected assets
          together with some key data for each one. You can also add a new
          asset.
        </Text>
        <Grid
          templateColumns={["1fr", "1fr", "3fr 1fr"]}
          gap={4}
          alignItems="center"
        >
          <GridItem>
            <Input
              border="solid 1px"
              m={0}
              size="lg"
              type="text"
              value={filter}
              onChange={handleFilterChange}
              placeholder="Filter Assets"
            />
          </GridItem>
          <GridItem>
            <Button
              bgColor={colourScheme.mainButton}
              color={colourScheme.mainButtonText}
              _hover={{
                color: colourScheme.mainButtonTextHover,
                bgColor: colourScheme.mainButtonHover,
              }}
              size="lg"
              w="full"
              onClick={handleAddNew}
            >
              Add a new asset
            </Button>
          </GridItem>
        </Grid>

        <CreateAssetPanel
          isOpen={isAddNewOpen}
          onClose={handleClose}
          onAdd={handleAdd}
        />

        {assetOfInterest ? (
          <AssetDataView
            isOpen={isDataViewOpen}
            assetOfInterest={assetOfInterest}
            onClose={handleAssetViewClose}
          />
        ) : (
          // TODO: Cover asset_id = 0 ...
          assetIdOfInterest != 0 && (
            <Text>{`Couldn't find that asset! ${assetIdOfInterest}`}</Text>
          )
        )}
      </Box>

      <Box w="100%">
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
        >
          {assets ? (
            filteredAssets.map((item, index) => (
              <GridItem key={index} p={5}>
                <AssetItem
                  key={index}
                  asset={item}
                  onDataViewClick={() => handleDataViewClick(item.id)}
                />
              </GridItem>
            ))
          ) : (
            <Text>Loading assets</Text>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default AssetView;

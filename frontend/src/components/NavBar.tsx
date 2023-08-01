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
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react";
import { CiSettings } from "react-icons/ci";
import { useSettings } from "../SettingsContext";
import { useState } from "react";
import NavButton from "./NavButton";

const NavBar = () => {
  const { settings, updateSettings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedSettings, setUpdatedSettings] = useState(settings);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setUpdatedSettings(settings); // Reset the updated settings to the current settings
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveChanges = () => {
    updateSettings(updatedSettings);
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setUpdatedSettings((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const textColour = "black";
  const bgColour = "#dddddd"; // "#f5d140"; //"#1463b3";

  return (
    <>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        padding="1rem"
        backgroundColor={bgColour} //"gray.800"
        color={textColour}
      >
        <Box px={["1rem", "1rem", "0"]} as="button">
          <Link href="/" display="flex" alignItems="center">
            <Image src="/omm_logo.svg" alt="OMM Logo" boxSize="60px" mr={1} />
          </Link>
        </Box>
        <Flex
          direction={["row", "row", "row"]}
          alignItems={["center", "center", "center"]}
          py={5}
        >
          <NavButton label="Assets" linkTo="/asset-view" />
          <NavButton label="Timeline" linkTo="/timeline" />
          <NavButton label="This Week" linkTo="/weekly-dashboard" />
          <NavButton label="Calendar" linkTo="/calendar" />
          <NavButton label="Rankings" linkTo="/ranking" />

          <IconButton
            aria-label="Settings"
            icon={<CiSettings />}
            size="lg"
            color={textColour}
            variant="ghost"
            fontSize="4xl"
            _focus={{ outline: "none" }}
            _hover={{ color: "teal" }}
            _activeLink={{ color: "red" }}
            onClick={handleOpenModal}
          />
        </Flex>
      </Flex>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalBody>
            <FormControl display="flex" alignItems="center" mb="4">
              <FormLabel htmlFor="day_duration" flex="1">
                Day Duration
              </FormLabel>
              <input
                type="number"
                id="day_duration"
                name="day_duration"
                value={updatedSettings.day_duration}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center" mb="4">
              <FormLabel htmlFor="week_start" flex="1">
                Week Start
              </FormLabel>
              <Select
                id="week_start"
                name="week_start"
                value={updatedSettings.week_start}
                onChange={handleInputChange}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NavBar;

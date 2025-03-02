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
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useBreakpointValue,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { CiSettings } from "react-icons/ci";
import { HiMenu } from "react-icons/hi";
import { FiSun, FiMoon, FiChevronDown } from "react-icons/fi";
import { useSettings } from "../SettingsContext";
import { useState } from "react";
import NavButton from "./NavButton";

type NavItem = {
  label: string;
  linkTo?: string;
  items?: {
    label: string;
    linkTo: string;
  }[];
};

const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { settings, updateSettings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedSettings, setUpdatedSettings] = useState(settings);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setUpdatedSettings(settings);
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

  const textColour = "white";

  const navItems: NavItem[] = [
    {
      label: "Monitoring",
      items: [
        { label: "Assets", linkTo: "/asset-view" },
        { label: "Timeline", linkTo: "/timeline" },
      ],
    },
    {
      label: "Utilisation Analysis",
      items: [
        { label: "This Week", linkTo: "/weekly-dashboard" },
        { label: "Calendar", linkTo: "/calendar" },
        { label: "Rankings", linkTo: "/ranking" },
        { label: "Comparison", linkTo: "/comparison" },
      ],
    },
    {
      label: "Downtime Management",
      items: [
        { label: "Downtime Logs", linkTo: "/downtime-logs" },
        { label: "Downtime Stats", linkTo: "/downtime-stats" },
      ],
    },
  ];

  const SettingsButton = () => (
    <IconButton
      aria-label="Settings"
      icon={<CiSettings />}
      size="lg"
      color={colorMode === "light" ? "gray.800" : "white"}
      variant="ghost"
      fontSize="4xl"
      _focus={{ outline: "none" }}
      _hover={{ color: "teal" }}
      _activeLink={{ color: "red" }}
      onClick={handleOpenModal}
    />
  );

  return (
    <>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1rem"
        bg={colorMode === "light" ? "white" : "gray.800"}
        boxShadow="sm"
      >
        <Box px={["1rem", "1rem", "0"]} as="button">
          <Link href="/" display="flex" alignItems="center">
            <Image src="/omm_logo.svg" alt="OMM Logo" boxSize="60px" mr={1} />
          </Link>
        </Box>

        {isMobile ? (
          <Flex gap={2}>
            <SettingsButton />
            <IconButton
              aria-label="Open menu"
              icon={<HiMenu />}
              size="lg"
              color={textColour}
              variant="ghost"
              fontSize="2xl"
              onClick={onOpen}
            />
          </Flex>
        ) : (
          <Flex direction="row" alignItems="center" py={5}>
            {navItems.map((item) =>
              item.items ? (
                <Menu key={item.label}>
                  <MenuButton
                    as={Button}
                    rightIcon={<FiChevronDown />}
                    variant="ghost"
                    _hover={{ color: "teal" }}
                  >
                    {item.label}
                  </MenuButton>
                  <MenuList>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.linkTo}
                        _hover={{ textDecoration: "none" }}
                        width="100%"
                        display="block"
                      >
                        <MenuItem>{subItem.label}</MenuItem>
                      </Link>
                    ))}
                  </MenuList>
                </Menu>
              ) : item.linkTo ? (
                <NavButton
                  key={item.label}
                  label={item.label}
                  linkTo={item.linkTo}
                />
              ) : null
            )}
            <Box display="flex" alignItems="center" gap={4}>
              <IconButton
                aria-label={`Switch to ${
                  colorMode === "light" ? "dark" : "light"
                } mode`}
                icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                onClick={() => {
                  toggleColorMode();
                  updateSettings({
                    ...settings,
                    colorMode: colorMode === "light" ? "dark" : "light",
                  });
                }}
                variant="ghost"
                size="md"
              />
              <SettingsButton />
            </Box>
          </Flex>
        )}
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" pt={4}>
              {navItems.map((item) =>
                item.items ? (
                  <VStack key={item.label} align="stretch" spacing={2}>
                    <Box fontWeight="bold">{item.label}</Box>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.linkTo}
                        onClick={onClose}
                        pl={4}
                        _hover={{ textDecoration: "none", color: "teal" }}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </VStack>
                ) : (
                  <Link
                    key={item.label}
                    href={item.linkTo}
                    onClick={onClose}
                    _hover={{ textDecoration: "none", color: "teal" }}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Settings Modal */}
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

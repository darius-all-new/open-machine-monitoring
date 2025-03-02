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
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  Text,
  Box,
  Icon,
  InputGroup,
  InputLeftElement,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaIndustry, FaCog, FaRss } from "react-icons/fa";
import { colourScheme } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (manufacturer: string, model: string, topic: string) => void;
}

const CreateAssetPanel = (props: Props) => {
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (manufacturer && model && topic) {
      setAddActive(true);
    } else {
      setAddActive(false);
    }
  }, [manufacturer, model, topic]);

  const [addActive, setAddActive] = useState(false);

  const handleAdd = () => {
    props.onAdd(manufacturer, model, topic);
    setManufacturer("");
    setModel("");
    setTopic("");
    props.onClose();
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      size="lg"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor} borderRadius="xl" overflow="hidden">
        <Box
          bg={colourScheme.mainButton}
          color="white"
          p={6}
          position="relative"
        >
          <ModalHeader p={0} fontSize="2xl" fontWeight="bold">
            Add New Asset
          </ModalHeader>
          <Text mt={2} fontSize="md" opacity={0.9}>
            Connect a new machine or piece of equipment to start monitoring its
            usage.
          </Text>
          <ModalCloseButton
            color="white"
            top={4}
            right={4}
            _hover={{ bg: "whiteAlpha.200" }}
          />
        </Box>

        <ModalBody pt={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={4} color="gray.600">
                Fill in the details below to register your new asset. Make sure
                to use the correct MQTT topic for your asset.
              </Text>
            </Box>

            <FormControl>
              <FormLabel fontWeight="medium">Manufacturer</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaIndustry} color="gray.400" />
                </InputLeftElement>
                <Input
                  pl={10}
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Who made the asset?"
                  _placeholder={{ color: "gray.400" }}
                  borderColor={borderColor}
                  _hover={{ borderColor: colourScheme.mainButton }}
                  _focus={{
                    borderColor: colourScheme.mainButton,
                    boxShadow: `0 0 0 1px ${colourScheme.mainButton}`,
                  }}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Model</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaCog} color="gray.400" />
                </InputLeftElement>
                <Input
                  pl={10}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="What is the asset's model?"
                  _placeholder={{ color: "gray.400" }}
                  borderColor={borderColor}
                  _hover={{ borderColor: colourScheme.mainButton }}
                  _focus={{
                    borderColor: colourScheme.mainButton,
                    boxShadow: `0 0 0 1px ${colourScheme.mainButton}`,
                  }}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Topic</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaRss} color="gray.400" />
                </InputLeftElement>
                <Input
                  pl={10}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="The MQTT topic that this asset will publish data to"
                  _placeholder={{ color: "gray.400" }}
                  borderColor={borderColor}
                  _hover={{ borderColor: colourScheme.mainButton }}
                  _focus={{
                    borderColor: colourScheme.mainButton,
                    boxShadow: `0 0 0 1px ${colourScheme.mainButton}`,
                  }}
                />
              </InputGroup>
            </FormControl>
          </VStack>
        </ModalBody>

        <Divider borderColor={borderColor} />

        <ModalFooter bg={useColorModeValue("gray.50", "gray.900")} p={4}>
          <Button
            variant="ghost"
            mr={3}
            onClick={props.onClose}
            _hover={{ bg: "gray.100" }}
          >
            Cancel
          </Button>
          <Button
            bg={colourScheme.mainButton}
            color="white"
            onClick={handleAdd}
            isDisabled={!addActive}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "lg",
            }}
            _disabled={{
              bg: "gray.300",
              cursor: "not-allowed",
              _hover: {
                transform: "none",
                boxShadow: "none",
              },
            }}
          >
            Add Asset
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateAssetPanel;

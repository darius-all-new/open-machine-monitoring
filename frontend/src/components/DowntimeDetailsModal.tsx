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
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Box,
  Text,
  useColorModeValue,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { getApiUrl } from '../config';

interface Downtime {
  id?: number;
  title: string;
  description: string;
  type: "planned" | "unplanned";
  start_time: string;
  end_time?: string;
  asset_id: number;
}

interface DowntimeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  assetName: string;
  startTime: string;
  endTime?: string;
  downtimeId?: number;
  onDowntimeUpdated: () => void;
}

const DowntimeDetailsModal: React.FC<DowntimeDetailsModalProps> = ({
  isOpen,
  onClose,
  assetId,
  assetName,
  startTime,
  endTime,
  downtimeId,
  onDowntimeUpdated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"planned" | "unplanned">("unplanned");
  const [isLoading, setIsLoading] = useState(false);
  const [existingDowntime, setExistingDowntime] = useState<Downtime | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (isOpen) {
      if (downtimeId) {
        fetchDowntimeDetails(downtimeId);
      } else {
        resetForm();
      }
    }
  }, [downtimeId, isOpen]);

  const fetchDowntimeDetails = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl(`get-downtime/${id}`));
      
      if (response.ok) {
        const data = await response.json();
        setExistingDowntime(data);
        setTitle(data.title);
        setDescription(data.description);
        setType(data.type);
        setIsEditMode(true);
      } else {
        // If the downtime doesn't exist (e.g., it was deleted), reset the form
        resetForm();
        toast({
          title: "Downtime not found",
          description: "The downtime event may have been deleted",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error fetching downtime details:", error);
      resetForm();
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("unplanned");
    setExistingDowntime(null);
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const downtimeData = {
        title,
        description,
        type,
        start_time: startTime,
        end_time: endTime,
        asset_id: assetId,
      };

      let response;

      if (isEditMode && downtimeId) {
        // Update existing downtime
        response = await fetch(getApiUrl(`update-downtime/${downtimeId}`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(downtimeData),
        });
      } else {
        // Create new downtime
        response = await fetch(getApiUrl("create-downtime"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(downtimeData),
        });
      }

      if (response.ok) {
        toast({
          title: isEditMode ? "Downtime updated" : "Downtime created",
          description: isEditMode
            ? "The downtime event has been updated successfully"
            : "A new downtime event has been created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDowntimeUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to process downtime event",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error submitting downtime:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!downtimeId) return;

    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl(`delete-downtime/${downtimeId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Downtime deleted",
          description: "The downtime event has been deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDowntimeUpdated();
        onClose();
        // Reset form after successful deletion
        resetForm();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to delete downtime event",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting downtime:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor} borderColor={borderColor}>
        <ModalHeader>
          {isEditMode ? "Edit Downtime Event" : "Create Downtime Event"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Text fontWeight="medium">Asset: {assetName}</Text>
            <Flex mt={2} gap={2}>
              <Badge colorScheme="blue">
                Start: {formatDateTime(startTime)}
              </Badge>
              {endTime && (
                <Badge colorScheme="green">
                  End: {formatDateTime(endTime)}
                </Badge>
              )}
            </Flex>
          </Box>

          <FormControl id="title" isRequired mb={4}>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this downtime event"
            />
          </FormControl>

          <FormControl id="description" mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened during this downtime"
              rows={4}
            />
          </FormControl>

          <FormControl id="type" isRequired mb={4}>
            <FormLabel>Type</FormLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as "planned" | "unplanned")}
            >
              <option value="planned">Planned</option>
              <option value="unplanned">Unplanned</option>
            </Select>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          {isEditMode && (
            <Button 
              colorScheme="red" 
              mr={3} 
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>
          )}
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DowntimeDetailsModal;

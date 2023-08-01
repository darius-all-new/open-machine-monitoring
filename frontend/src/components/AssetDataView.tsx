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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import LineGraph from "./LineGraph";
import { Asset } from "../types";

interface Props {
  isOpen: boolean;
  assetOfInterest: Asset;
  onClose: () => void;
}

const AssetDataView = (props: Props) => {
  useEffect(() => {
    {
      props.isOpen && console.log("Data view open.");
    }
  }, [props.isOpen]);

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Data View</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                {props.isOpen &&
                  `${props.assetOfInterest.manufacturer} ${props.assetOfInterest.model} (topic: ${props.assetOfInterest.topic})`}
              </Text>
              <Text></Text>
              <LineGraph id={props.assetOfInterest.id} />
            </VStack>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AssetDataView;

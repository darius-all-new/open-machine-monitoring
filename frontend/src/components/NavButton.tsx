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

import { Box, Link } from "@chakra-ui/react";

interface Props {
  label: string;
  linkTo: string;
  external?: boolean;
}

const NavButton = (props: Props) => {
  return (
    <>
      <Box as="button" px={3}>
        {props.external ? (
          <Link
            _hover={{ textDecoration: "none" }}
            href={props.linkTo}
            isExternal
          >
            {props.label}
          </Link>
        ) : (
          <Link _hover={{ textDecoration: "none" }} href={props.linkTo}>
            {props.label}
          </Link>
        )}
      </Box>
    </>
  );
};

export default NavButton;

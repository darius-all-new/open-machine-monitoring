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

import { UsageRecord } from "../types";
import { calculateUptime, determineTrend } from "../functions";
import { Text } from "@chakra-ui/react";

interface Props {
  usageData: UsageRecord[];
}

const TrendMessage = (props: Props) => {
  return (
    <div>
      <Text p={5}>
        Summary: {determineTrend(calculateUptime(props.usageData))}
      </Text>
    </div>
  );
};

export default TrendMessage;

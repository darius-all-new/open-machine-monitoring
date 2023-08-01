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
  Grid,
  GridItem,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Asset } from "../types";
import { fetchAsset } from "../functions";

interface Props {
  asset_id: number;
  average_uptime: number;
  last_week_uptime: number | string;
}

const RankingAssetPanel = (props: Props) => {
  //   const { settings, updateSettings } = useSettings();
  const initAsset = {} as Asset;
  const [asset, setAsset] = useState<Asset>(initAsset);
  useEffect(() => {
    fetchAsset(setAsset, props.asset_id);
  }, [props.asset_id]);

  let percentChangeUptime = 0;
  if (typeof props.last_week_uptime === "number") {
    percentChangeUptime =
      (100 * (props.average_uptime - props.last_week_uptime)) /
      props.last_week_uptime;
  }

  return (
    <Grid p={5} templateColumns="repeat(2, 1fr)">
      <GridItem>
        <Text fontSize="xl" fontWeight="bold">
          {asset && asset.manufacturer} {asset && asset.model}
        </Text>
      </GridItem>
      <GridItem>
        <Stat>
          <StatLabel>Average uptime this week</StatLabel>
          <StatNumber> {props.average_uptime.toFixed(2)}%</StatNumber>
          <StatHelpText>
            {props.last_week_uptime === "unavailable" ? (
              <Text>No data for last week</Text>
            ) : (
              <>
                <StatArrow
                  type={percentChangeUptime > 0 ? "increase" : "decrease"}
                />
                {`${percentChangeUptime.toFixed(2)}% on previous week`}
              </>
            )}
          </StatHelpText>
        </Stat>
      </GridItem>
    </Grid>
  );
};

export default RankingAssetPanel;

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

import { useEffect, useState } from "react";
import { Asset, UsageRecord } from "../types";
import { calculateDaysToWeekStart, fetchUsageRecords } from "../functions";
import { useSettings } from "../SettingsContext";
import BarChartComponent from "./BarChartComponent";
import { Center, Text } from "@chakra-ui/react";
import TrendMessage from "./TrendMessage";

interface Props {
  asset: Asset;
  searchTerm: string;
}

const WeeklyViewAssetPanel = (props: Props) => {
  const { settings, updateSettings } = useSettings();
  const [usageRecordData, setUsageRecordData] = useState<UsageRecord[]>([]);

  useEffect(() => {
    fetchUsageRecords(
      calculateDaysToWeekStart(settings.week_start),
      setUsageRecordData,
      props.asset.id
    );
  }, [settings, props.searchTerm]);

  return (
    <>
      <Text p={5}>
        {props.asset.manufacturer} {props.asset.model}
      </Text>
      {usageRecordData.length > 0 ? (
        <>
          <BarChartComponent data={usageRecordData} />
          <TrendMessage usageData={usageRecordData} />
        </>
      ) : (
        <Center>
          <Text fontWeight="bold" p={5}>
            No usage data for {props.asset.manufacturer} {props.asset.model}
          </Text>
        </Center>
      )}
    </>
  );
};

export default WeeklyViewAssetPanel;

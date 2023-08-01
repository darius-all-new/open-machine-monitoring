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
  Brush,
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import { Data, colourScheme, currentBounds } from "../types";
import { retrieveData } from "../functions";

interface Props {
  id: number;
}

const LineGraph = (props: Props) => {
  const [gdata, setGdata] = useState<Data[]>([]);
  useEffect(() => {
    const currentTime = new Date().toISOString();
    // TODO: Allow the user to choose the time range.
    const timeMinusHour = new Date(
      new Date().getTime() - 60 * 60 * 1000
    ).toISOString();

    const fetchData = async () => {
      retrieveData(setGdata, props.id, timeMinusHour, currentTime);
    };

    fetchData();
  }, []);

  // const formatXAxis = (tickItem: string) => {
  //   const date = new Date(tickItem);
  //   return date.toLocaleString(); // Adjust the format as needed
  // };

  const formatTooltipLabel = (value: string) => {
    const date = new Date(value);
    return date.toLocaleString(); // Adjust the format as needed
  };

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    const now = new Date();
    const diffInMinutes = Math.round(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `-${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `-${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return `-${diffInDays}d`;
    }
  };

  return (
    <>
      {gdata.length > 0 ? (
        <ResponsiveContainer aspect={3.0}>
          <LineChart
            data={gdata}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid stroke="none" />
            <XAxis dataKey="time" tickFormatter={formatXAxis} tickCount={1} />
            <YAxis>
              <Label angle={-90}>Current (A)</Label>
            </YAxis>
            <Tooltip labelFormatter={formatTooltipLabel} />
            <Legend />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#000000"
              dot={false}
              activeDot={{ r: 8 }}
            />
            <ReferenceArea
              y1={0}
              y2={currentBounds.off}
              fill={colourScheme.red}
            />
            <ReferenceArea
              y1={currentBounds.off}
              y2={currentBounds.on}
              fill={colourScheme.orange}
            />
            <ReferenceArea
              y1={currentBounds.on}
              y2={8}
              fill={colourScheme.green}
            />
            <Brush dataKey="x" height={30} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Text>No Data</Text>
      )}
    </>
  );
};

export default LineGraph;

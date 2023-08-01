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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { UsageRecord, colourScheme, uptimeBounds } from "../types";
import { Center } from "@chakra-ui/react";
import { calculateSingleUptime } from "../functions";

interface Props {
  data: UsageRecord[];
}

const BarChartComponent = (props: Props) => {
  const uptime_label = "Uptime (%)";

  const usageDataMinutes = props.data.map((d) => ({
    ...d,
    [uptime_label]: calculateSingleUptime(d),
    color: "red",
  }));

  const getColour = (v: number) => {
    if (v >= uptimeBounds.good) {
      return colourScheme.green;
    }
    if (v < uptimeBounds.good && v >= uptimeBounds.bad) {
      return colourScheme.orange;
    }
    if (v < uptimeBounds.bad) {
      return colourScheme.red;
    }
  };

  return (
    <Center>
      <ResponsiveContainer width="80%" aspect={3.0}>
        <BarChart data={usageDataMinutes}>
          <CartesianGrid />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              const formattedDate = new Date(date);
              // TODO: Support location
              return formattedDate.toLocaleDateString("en-GB", {
                weekday: "short",
              });
            }}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip
            labelFormatter={(value) => {
              const formattedDate = new Date(value);
              return formattedDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            }}
            formatter={(value: number) => Math.round(value)}
            contentStyle={{
              borderRadius: "10px",
            }}
          />
          <Bar dataKey={uptime_label}>
            {usageDataMinutes.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColour(entry[uptime_label])}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Center>
  );
};

export default BarChartComponent;

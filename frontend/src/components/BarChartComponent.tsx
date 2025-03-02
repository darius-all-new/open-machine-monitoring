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
import { Box, Center, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { calculateSingleUptime } from "../functions";

interface Props {
  data: UsageRecord[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const color = value >= uptimeBounds.good 
      ? colourScheme.green 
      : value >= uptimeBounds.bad 
        ? colourScheme.orange 
        : colourScheme.red;

    return (
      <Box
        bg={useColorModeValue("white", "gray.800")}
        p={3}
        borderRadius="md"
        boxShadow="lg"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.600")}
      >
        <Text 
          fontWeight="medium" 
          mb={2}
          color={useColorModeValue("gray.700", "gray.100")}
        >
          {new Date(label).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </Text>
        <Box 
          bg={useColorModeValue("gray.50", "gray.700")} 
          p={2} 
          borderRadius="md"
        >
          <Text 
            color={color} 
            fontSize="lg" 
            fontWeight="bold"
          >
            {Math.round(value)}% Uptime
          </Text>
        </Box>
      </Box>
    );
  }
  return null;
};

const BarChartComponent = (props: Props) => {
  const uptime_label = "Uptime (%)";
  const colorMode = useColorMode();
  const isDark = colorMode.colorMode === 'dark';
  
  const gridColor = isDark ? "#4A5568" : "#E2E8F0";
  const axisColor = isDark ? "#FFFFFF" : "#2D3748";

  const usageDataMinutes = props.data.map((d) => ({
    ...d,
    [uptime_label]: calculateSingleUptime(d),
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
    <Center w="100%" h="100%">
      <ResponsiveContainer width="95%" aspect={2.5}>
        <BarChart 
          data={usageDataMinutes} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={gridColor} 
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              return new Date(date).toLocaleDateString("en-GB", {
                weekday: "short",
              });
            }}
            tick={{ fill: axisColor }}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: axisColor }}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
            tickCount={6}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: isDark ? "#2D3748" : "#EDF2F7", opacity: 0.3 }}
          />
          <Bar 
            dataKey={uptime_label}
            radius={[4, 4, 0, 0]}
          >
            {usageDataMinutes.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColour(entry[uptime_label])}
                style={{
                  filter: "brightness(1)",
                  transition: "filter 0.2s, opacity 0.2s",
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.filter = "brightness(1.2)";
                  e.target.style.opacity = "0.9";
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.filter = "brightness(1)";
                  e.target.style.opacity = "1";
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Center>
  );
};

export default BarChartComponent;

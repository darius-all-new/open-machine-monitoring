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
        <ResponsiveContainer aspect={2.5}>
          <LineChart
            data={gdata}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxis} 
              stroke="#718096"
              tick={{ fill: '#718096' }}
            >
              <Label
                value="Time"
                position="bottom"
                offset={0}
                style={{ fill: '#718096', fontSize: '0.9em' }}
              />
            </XAxis>
            <YAxis 
              stroke="#718096"
              tick={{ fill: '#718096' }}
            >
              <Label 
                value="Current (A)" 
                angle={-90} 
                position="left"
                style={{ fill: '#718096', fontSize: '0.9em' }}
              />
            </YAxis>
            <Tooltip
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              itemStyle={{ color: '#2D3748' }}
              labelStyle={{ color: '#718096' }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: '#4A5568', fontSize: '0.9em' }}>
                  {value === 'current' ? 'Power Consumption' : value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke={colourScheme.mainButton}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: colourScheme.mainButton,
                strokeWidth: 2,
                fill: 'white'
              }}
            />
            <ReferenceArea
              y1={0}
              y2={currentBounds.off}
              fill={colourScheme.red}
              fillOpacity={0.1}
              strokeOpacity={0}
            />
            <ReferenceArea
              y1={currentBounds.off}
              y2={currentBounds.on}
              fill={colourScheme.orange}
              fillOpacity={0.1}
              strokeOpacity={0}
            />
            <ReferenceArea
              y1={currentBounds.on}
              y2={8}
              fill={colourScheme.green}
              fillOpacity={0.1}
              strokeOpacity={0}
            />
            <Brush 
              dataKey="time" 
              height={30} 
              stroke={colourScheme.mainButton}
              fill="white"
              tickFormatter={formatXAxis}
              startIndex={Math.max(0, gdata.length - 50)}
            >
              <Label
                value="Drag to zoom"
                position="top"
                offset={10}
                style={{ fill: '#718096', fontSize: '0.8em' }}
              />
            </Brush>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Text color="gray.500" textAlign="center" py={8}>
          No data available for this time period
        </Text>
      )}
    </>
  );
};

export default LineGraph;

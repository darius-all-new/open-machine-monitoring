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

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import AssetView from "./Pages/AssetView";
import TimeLineView from "./Pages/TimeLineView";
import ThisWeekView from "./Pages/ThisWeekView";
import CalendarView from "./Pages/CalendarView";
import RankingView from "./Pages/RankingView";
import ComparisonView from "./Pages/ComparisonView";
import DowntimeLogsView from "./Pages/DowntimeLogsView";
import DowntimeStatsView from "./Pages/DowntimeStatsView";
import HomePage from "./Pages/HomePage";
import { useSettings } from "./SettingsContext";
import { theme } from "./theme.ts";

function AppContent() {
  const { settings } = useSettings();
  
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={settings.colorMode} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/asset-view" element={<AssetView />} />
          <Route path="/timeline" element={<TimeLineView />} />
          <Route path="/weekly-dashboard" element={<ThisWeekView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/ranking" element={<RankingView />} />
          <Route path="/comparison" element={<ComparisonView />} />
          <Route path="/downtime-logs" element={<DowntimeLogsView />} />
          <Route path="/downtime-stats" element={<DowntimeStatsView />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;

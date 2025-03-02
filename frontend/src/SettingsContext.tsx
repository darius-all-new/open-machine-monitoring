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

import React, { createContext, useContext, useEffect, useState } from "react";
import { Settings, BackendSettings } from "./types";
import { fetchSettings, changeSettings } from "./functions";

const initialSettings: Settings = {
  id: 1,
  day_duration: 0,
  week_start: "Monday",
  colorMode: 'light',
  day_start_hour: 8,    // Default to 8 AM
  day_end_hour: 20      // Default to 8 PM
};

type SettingsContextProps = {
  children: React.ReactNode;
};

export const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
}>({
  settings: initialSettings,
  updateSettings: () => {},
});

export const SettingsProvider: React.FC<SettingsContextProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const response = await fetchSettings();
        if (response) {
          // Merge backend settings with frontend colorMode
          const frontendSettings: Settings = {
            ...response,
            colorMode: settings.colorMode // Preserve existing colorMode
          };
          setSettings(frontendSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    getSettings();
  }, []);

  const updateSettings = async (newSettings: Settings) => {
    try {
      // Extract backend-only settings
      const backendSettings: BackendSettings = {
        id: newSettings.id,
        day_duration: newSettings.day_duration,
        week_start: newSettings.week_start,
        day_start_hour: newSettings.day_start_hour,
        day_end_hour: newSettings.day_end_hour
      };
      
      // Update backend
      await changeSettings(backendSettings);
      
      // Update frontend state
      setSettings(newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

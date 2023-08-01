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
import { Settings } from "./types";
import { changeSettings, fetchSettings } from "./functions";

const initialSettings: Settings = {
  id: 1,
  day_duration: 0,
  week_start: "Monday",
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
        setSettings(response);
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    getSettings();
  }, []);

  // Update the settings with the new values
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    changeSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

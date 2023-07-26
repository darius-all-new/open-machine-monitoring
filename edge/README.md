# OpenMachineMonitoring Edge Components

This section contains important functionality for producing data.

## Contents

### 1. /arduino

Contains an Arduino sketch for reading current data from a current clamp sensor.

Sensor: https://wiki.dfrobot.com/Gravity_Analog_AC_Current_Sensor__SKU_SEN0211_

You can buy these sensors from: https://thepihut.com/products/gravity-analog-ac-current-sensor

### 2. /mock_datasource

Contains scripts for producing mock data on a Raspberry Pi.

There is a Python script for generating mock data and publishing it to a MQTT server.

There is also a service script so you can run the Python mock data script automatically whenever the Raspberry Pi boots up.

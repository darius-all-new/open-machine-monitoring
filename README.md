# OpenMachineMonitoring

![OpenMachineMonitoring logo](assets/OMM_Logo_2xPNG%402x.png)

[Link to the OpenMachineMonitoring Blog](https://openmachinemonitoring.substack.com/)

OpenMachineMonitoring is an open-source tool for keeping track of machine activity in manufacturing facilities.

## Running OpenMachineMonitoring on a Raspberry Pi

You can run OpenMachineMonitoring on a Raspberry Pi.

### Prerequisites:

- The OpenMachineMonitoring repo cloned onto your Raspberry Pi
- An InfluxDB account (for storing electrical current data)
- A Telegraf agent configured on your InfluxDB account (you will need an MQTT consumer configured with the correct MQTT connection parameters and topic subscriptions)
- Telegraf installed on your Raspberry Pi ([Telegraf installation](https://portal.influxdata.com/downloads/))
- A HiveMQ account (for MQTT)
- Either the mock data source (see `edge/mock_datasource`) or some real current sensor operating and publishing data to your MQTT server

### Backend

#### 1. Install Python modules

Navigate to the `backend` folder and run:

`pip install -r requirements.txt`

Make sure you are using the correct pip for your Python version/environment. It is advisable to use a virtual environment to keep everything tidy.

#### 2. Configuration file

Rename `config_example.toml` to `config.toml`

Replace the InfluxDB placeholders with real values. You will need the details from your InfluxDB account (token, bucket, URL and organisation)

#### 3. Add the Raspberry Pi to the permitted origins

Open `main.py` and add the following line to the `origins` array:

`"http://<YOUR RASPBERRY PI'S NETWORK ADDRESS>:5173"`

#### 4. Run the backend

We are now ready to run OpenMachineMonitoring's backend!

Navigate to the `/backend` folder and run the following:

`python -m uvicorn main:app --reload --host 0.0.0.0`

This will startup the backend and make it available on your network. You can check this with another computer (connected to the same network) by opening a browser and navigating to the following:

`http://<YOUR RASPBERRY PI'S NETWORK ADDRESSS>:8000/docs`

You should see the documentation page of the OpenMachineMonitoring API.

#### 5. Configure the service (if you want the backend to run automatically)

To run the backend on the Raspberry Pi automatically there is a backend service script.

Navigate to the `services` folder and move `omm_backend_example.service` to `/etc/systemd/system` folder. Rename the service to `omm_backend.service` or anything else you want.

Make the necessary changes to the placeholders in the service script:

- Add the correct working directory (`pwd` when in the `backend` folder on the Pi)
- Add the correct user
- Make sure the path to `uvicorn` is correct (if you are using a venv it should be `path/to/your/venv/bin/uvicorn`)

Next, enable and start the service:

`sudo systemctl daemon-reload`

`sudo systemctl enable omm_backend.service`

`sudo systemctl start omm_backend.service`

That's it. If you restart the Raspberry Pi the backend should come back up (you can verify this by navigating to the documentation page again)

### Frontend

#### 1. Install modules

Navigate to the `frontend` folder and install the necessary node modules:

`npm install`

#### 2. Change the host

Open up `frontend/src/functions.ts` and change the `BASE_URL` to match the Raspberry Pi's local address:

`const BASE_URL = "http://<YOUR RASPBERRY PI'S NETWORK ADDRESS>:8000"`

Note: At the moment, you will also need to make this change to line 284 in `/frontend/src/components/TimeBarPanel.tsx`.

#### 3. Run the frontend

Navigate to the `/frontend` folder and run the following:

`npm run dev -- --host`

This will startup the frontend and make it available on your network. Open a browser on another computer (connected to the same network) and navigate to:

`http://<YOUR RASPBERRY PI'S NETWORK ADDRESS>:5173`

You should see the OpenMachineMonitoring frontend!

#### 4. Configure the service (if you want the frontend to run automatically)

To run the frontend on the Raspberry Pi automatically there is a frontend service script.

Navigate to the `services` folder and move `omm_frontend_example.service` to the `/etc/systemd/system` folder. Rename the service to `omm_frontend.service` or anything else you want.

Make the necessary changes to the placeholders in the service script:

- Add the correct working directory (`pwd` when in the `frontend` folder on the Pi)
- Add the correct user

Next, enable and start the service:

`sudo systemctl daemon-reload`

`sudo systemctl enable omm_frontend.service`

`sudo systemctl start omm_frontend.service`

### Telegraf Service

OpenMachineMonitoring ingests data from MQTT messages via a Telegraf agent. The agent channels messages from an MQTT broker to an InfluxDB database in the cloud.

Navigate to the `services` folder and move `telegraf_startup_example.service` to the `/etc/systemd/system` folder. Rename the service to `telegraf_startup.service` or anything else you want.

Make the necessary changes to the placeholders in the service script:

- Add the correct user
- Add your Influx token (taken from your InfluxDB account)
- Add the correct Telegraf URL (obtained from your InfluxDB console under Load Data -> Telegraf and clicking on "Setup Instructions" under your Telegraf agent)
- Make sure the path to `telegraf` is correct (type `which telegraf` to get the path to your telegraf)

Next, enable and start the service:

`sudo systemctl daemon-reload`

`sudo systemctl enable telegraf_startup.service`

`sudo systemctl start telegraf_startup.service`

### Daily Usage Calculation

To calculate the usage for the previous day we can set up a cron job that will run a shell script every morning at 09:00.

The shell script is located at `cronjobs/calc_yesterdays_usage.sh`

Inside the script make sure to fill out the placeholder with your Raspberry Pi's network address:

`curl -X POST http://<YOUR RASPBERRY PI NETWORK ADDR>:8000/create-usage-records`

You will also need to change the permissions on the shell script so that it can be executed:

`chmod +x /path/to/repo/cronjobs/calc_yesterdays_usage.sh`

With that done, all we need to do is open the crontab (`crontab -e`) and add the following line to the bottom of the file:

`0 9 * * * /path/to/repo/cronjobs/calc_yesterdays_usage.sh >> /path_to_repo/cronjobs/cron_log.txt 2>&1`

### Questions, feedback, problems

If you have any issues or questions, don't hesitate to reach out!

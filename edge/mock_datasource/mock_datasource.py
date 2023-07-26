import random
import datetime
import time
import paho.mqtt.client as mqtt
import json

# MQTT broker settings
broker_address = "<MQTT SERVER URL"
broker_port = 8883
broker_username = "MQTT USER"
broker_password = "MQTT PASSWORD"

topic = "MQTT TOPIC"

# Set the interval for measurements (seconds)
MEASUREMENT_INTERVAL = 60

# Schedule settings
# Set a schedule for the mock data
schedule = {
    "00:00": (0.0, 0.2),
    "08:00": (4, 5),
    "10:00": (0.0, 0.3),
    "10:15": (4, 5),
    "12:00": (0.0, 0.3),
    "13:00": (0.6, 1.4),
    "14:00": (5, 7),
    "18:00": (0.0, 0.2),
    "23:59": (0.0, 0.2)
}

# Generate dummy data based on the schedule
def generate_dummy_data():
    current_time = datetime.datetime.now().strftime("%H:%M")

    for start_time, (min_current, max_current) in schedule.items():
        if current_time < start_time:
            break

        if current_time >= start_time:
            end_time = list(schedule.keys())[list(schedule.keys()).index(start_time) + 1]

            if current_time < end_time:
                current = random.uniform(min_current, max_current)
                timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f%z")

                return {"current": current}

# MQTT on_connect event handler
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker")
    client.subscribe(topic)  # Subscribe to the topic

# MQTT on_publish event handler
def on_publish(client, userdata, mid):
    print(f"Data published to MQTT broker with message ID: {mid}")

if __name__=="__main__":

    # Connect to the MQTT broker
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_publish = on_publish
    client.tls_set()
    client.username_pw_set(broker_username, broker_password)
    client.connect(broker_address, broker_port, keepalive=60)
    client.loop_start()

    try:
        while True:
            dummy_data = generate_dummy_data()
            if dummy_data:
                payload = json.dumps(dummy_data)  # Convert the dictionary to a string
                client.publish(topic, payload)  # Publish the data to the "test" topic
                print(f"Published: {payload}")
            time.sleep(MEASUREMENT_INTERVAL)  # Wait before publishing the next data point

    except KeyboardInterrupt:
        print("Script interrupted")
        client.loop_stop()
        client.disconnect()

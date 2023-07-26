'''

Arduino sketch for reading a YHDC current sensor and 
publishing the data to a HiveMQ MQTT server in the cloud.

More information on the current sensor (including sample code):
https://wiki.dfrobot.com/Gravity_Analog_AC_Current_Sensor__SKU_SEN0211_

'''

#include <WiFiNINA.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Sensor parameters
const int ACPin = A2;
#define ACDetectionRange 20
#define VREF 5.0

// WIFI Connection Info
const char* ssid = "<YOUR NETWORK>";
const char* password = "<YOUR NETWORK PASSWORD>";
int status = WL_IDLE_STATUS;

// MQTT Connection Info
const char* mqttServer = "<MQTT SERVER URL>";
const int mqttPort = 8883;
const char* mqttUser = "<USERNAME>";
const char* mqttPassword = "<PASSWORD>";

WiFiSSLClient ommEdgeClient;
PubSubClient client(ommEdgeClient);

StaticJsonDocument<256> msgJson;

void setup() {
  Serial.begin(115200);

  Serial.println("Starting up ...");

  status = WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("Connected to WiFi");

  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  Serial.println("Connected to WiFi");

  // Connect to MQTT broker
  client.setServer(mqttServer, mqttPort);

}

void loop() {
  // Check the Wifi connection:
  // long rssi = WiFi.RSSI();
  // Serial.print("signal strength (RSSI):");
  // Serial.print(rssi);
  // Serial.println(" dBm");

  if (!client.connected()) reconnect();

  client.loop();

  // String testMessage = "hello just testing";
  // char topic[50];
  // sprintf(topic, "testing");
  // client.publish(topic, testMessage.c_str());

  float ACCurrentValue = readACCurrentValue(); //read AC Current Value
  Serial.print(ACCurrentValue);
  Serial.println("A");

  msgJson["current"] = ACCurrentValue; //randCurrent;
  String jsonString;
  serializeJson(msgJson, jsonString);

  char topic[50];
  sprintf(topic, "testmachine");
  client.publish(topic, jsonString.c_str());

  delay(5000);

}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Connecting to MQTT broker...");
    if (client.connect("arduino123", mqttUser, mqttPassword)) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed to connect to MQTT broker, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// Function taken from: 
// https://wiki.dfrobot.com/Gravity_Analog_AC_Current_Sensor__SKU_SEN0211_
float readACCurrentValue()
{
  float ACCurrentValue = 0;
  float peakVoltage = 0;  
  float voltageVirtualValue = 0;  //Vrms
  for (int i = 0; i < 5; i++)
  {
    peakVoltage += analogRead(ACPin);   //read peak voltage
    delay(1);
  }
  peakVoltage = peakVoltage / 5;   
  voltageVirtualValue = peakVoltage * 0.707;    //change the peak voltage to the Virtual Value of voltage

  /*The circuit is amplified by 2 times, so it is divided by 2.*/
  voltageVirtualValue = (voltageVirtualValue / 1024 * VREF ) / 2;  

  ACCurrentValue = voltageVirtualValue * ACDetectionRange;

  return ACCurrentValue;
}

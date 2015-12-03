//Energy Optimizer

//Including Required Libraries
#include <Adafruit_CC3000.h>
#include <SPI.h>
#include <CC3000_MDNS.h>
#include <aREST.h>

//Relay state
const int relayPin = 8;

// Define measurement variables
float ampCurrent; // Amplitude Current
float effValue; // Effective Value
float effVoltage = 230; // Effective voltage can be 230V or 110V depending on the place
float effPower; // Power calculated based on the voltage and current
float zeroSensor;

// These are the pins for the CC3000 chip if you are using a breakout board
#define ADAFRUIT_CC3000_IRQ   3
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10

// Create CC3000 instance
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT,
                                         SPI_CLOCK_DIV2);
// Create aREST instance
aREST rest = aREST();

// Your WiFi SSID and password                                         
#define WLAN_SSID       "home_54122" // ssid of the network
#define WLAN_PASS       "Legacy@5412" // password of the network
#define WLAN_SECURITY   WLAN_SEC_WPA2

// The port to listen for incoming TCP connections 
#define LISTEN_PORT           80

// Server instance
Adafruit_CC3000_Server restServer(LISTEN_PORT);

// DNS responder instance
MDNSResponder mdns;

// Variables to be exposed to the API
int power;

void setup(void)
{  
  // Start Serial
  Serial.begin(9600); // 9600 baud rate
  
  // Initialize variables and expose them to REST API
  rest.variable("power",&power);
  
  // Setting relay pin to output
  pinMode(relayPin,OUTPUT);
  
  // setting up null current
  zeroSensor = getSensorValue(A0);
   
  // Setting name and IP of the device
  rest.set_id("001");
  rest.set_name("smart_lamp");
  
  // Using CC3000 to connect to the wireless network.

  if (!cc3000.begin())
  {
    while(1);
  }
  Serial.println(F("done."));
  
  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
    while(1);
  }
  while (!cc3000.checkDHCP())
  {
    delay(100);
  }
  
  // Start multicast DNS responder
  if (!mdns.begin("arduino", cc3000)) {
    while(1); 
  }
  
  // Display connection details
  displayConnDetails();
   
  // Start server
  restServer.begin();
  
}

void loop() {
  
  // Perform power measurement
  float sensorValue = getSensorValue(A0);
    
  // Convert to current
  ampCurrent = (float)(sensorValue-zeroSensor)/1024*5/185*1000000;
  effValue = ampCurrent/1.414;
  effPower = abs(effValue*effVoltage/1000);
  power = (int)effPower;
  
  // Handling DNS requests
  mdns.update();
  
  // REST calls
  Adafruit_CC3000_ClientRef adfClient = restServer.available();
  rest.handle(adfClient);
  
}

// Function to display connection details
bool displayConnDetails(void)
{
  uint32_t ipAddr, ipNetmask, ipGateway, ipDHCPserv, ipDNSserv;
  
  if(!cc3000.getIPAddress(&ipAddr, &ipNetmask, &ipGateway, &ipDHCPserv, &ipDNSserv))
  {
    Serial.println(F("Unable to retrieve the IP Address!\r\n"));
    return false;
  }
  else
  {
    Serial.print(F("\nIP Address of the cc3000 WiFi sensor: ")); cc3000.printIPdotsRev(ipAddr);
    Serial.println();
    return true;
  }
}

// Reading of the Power Sensor
float getSensorValue(int pin)
{
  int sensorValue;
  float avgSensor = 0;
  int nb_measurements = 500;
  for (int i = 0; i < nb_measurements; i++) {
    sensorValue = analogRead(pin);
    avgSensor = avgSensor + float(sensorValue);
  }	  
  avgSensor = avgSensor/float(nb_measurements);
  return avgSensor;
}

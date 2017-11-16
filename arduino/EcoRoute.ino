#include <DHT.h> // For the temperature and humidity sensor 

#define DHTPIN 2
// Connecting to one of the digital Pins as VCC and ground as, 5 V supply pin not available
#define DHTVCC 5
#define DHTGND 7

#define ADCREAD_CARBONMONOXIDE 0

#include <SoftwareSerial.h> // For the second serial port
#include <TinyGPS.h> //GPS Parser

DHT dht(DHTPIN, DHT22);

SoftwareSerial GpsSerail(10, 11); // RX, TX

// This structure will hold all the data to be sent to the Raspberry PI
struct SensorBundle
{
  float humidity;
  float temperature;
  int carbonMonoxideSenVal;
  float latitude;
  String hemisphereLat;
  float longitude;
  String hemisphereLong;
};

void setup() {
  pinMode(5,OUTPUT);
  pinMode(7,OUTPUT);
  digitalWrite(5,HIGH);
  digitalWrite(7,LOW);
  Serial.begin(9600);
  GpsSerail.begin(9600);

  
  dht.begin();
}

void loop() {
  
  SensorBundle sensorBundle;
  bool retVal = false;
    // Wait a few seconds between measurements.
  getGpsData(&sensorBundle.latitude, &sensorBundle.longitude);
  
  // Get the Temperature and Humidity data from the sensor
  getTempData(&sensorBundle.temperature, &sensorBundle.humidity);
  // Get the reading of the carbon monoxide sensor 
  sensorBundle.carbonMonoxideSenVal = getCarbonMonData();
  
  // Send all the data to Raspi for further processing.
  sendDataRasPi(&sensorBundle);

  
  delay(1500);

  
}

// Send the data to Raspi in JSON format
void sendDataRasPi(struct SensorBundle *sensorBundle)
{
  //Serial.println("BEGIN");
  Serial.print("{\"temp\":");
  Serial.print(sensorBundle->temperature);
  Serial.print(",");
  
  Serial.print("\"humidity\":");
  Serial.print(sensorBundle->humidity); 
  Serial.print(",");

  Serial.print("\"carbon\":");
  Serial.print(sensorBundle->carbonMonoxideSenVal); 
  Serial.print(",");
  
  Serial.print("\"lat\":");
  Serial.print(sensorBundle->latitude);
  Serial.print(",");

//  Serial.println(sensorBundle->hemisphereLat);
  Serial.print("\"long\":");
  Serial.print(sensorBundle->longitude);
  
  Serial.println("}");
  //Serial.println(sensorBundle->hemisphereLong);
  //Serial.println("END");

}

int getCarbonMonData()
{

  return analogRead(ADCREAD_CARBONMONOXIDE);
}

// Read and update the temperature and humidity data.

void getTempData(float *temp, float *humidity)
{
  *humidity = dht.readHumidity();
  *temp = dht.readTemperature();
}

bool getGpsData(float *latitude, float *longitude)
{
  TinyGPS gps;
  bool newLoc;
  
  unsigned long chars;
  unsigned short sentences, failed;

  for (unsigned long start = millis(); millis() - start < 1000;)
  {
    while (GpsSerail.available())
    {
      char c = GpsSerail.read();
      // Serial.write(c); // uncomment this line if you want to see the GPS data flowing
      if (gps.encode(c)) // Did a new valid sentence come in?
        newLoc = true;
    }
  }

  if (newLoc)
  {
    float flat, flon;
    unsigned long age;
    gps.f_get_position(&flat, &flon, &age);
    
    *latitude = flat;
    *longitude = flon;
    
  }
  
  gps.stats(&chars, &sentences, &failed);
}




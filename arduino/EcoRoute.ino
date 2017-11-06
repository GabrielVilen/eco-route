#include <DHT.h>

#define DHTPIN 2
// Connecting to one of the digital Pins as VCC and ground as, 5 V supply pin not available
#define DHTVCC 5
#define DHTGND 7

#define ADCREAD_CARBONMONOXIDE 0

#include <SoftwareSerial.h>

DHT dht(DHTPIN, DHT22);

SoftwareSerial GPS(10, 11); // RX, TX
int updates;
int failedUpdates;
int pos;
int stringplace = 0;

String timeUp;
String nmea[15];
String labels[12] {"Time: ", "Status: ", "Latitude: ", "Hemisphere: ", "Longitude: ", "Hemisphere: ", "Speed: ", "Track Angle: ", "Date: "};

// This structure will hold all the data to be sent to the Raspberry PI
struct SensorBundle
{
  float humidity;
  float temperature;
  int carbonMonoxideSenVal;
  String latitude;
  String hemisphereLat;
  String longitude;
  String hemisphereLong;
};

void setup() {
  pinMode(5,OUTPUT);
  pinMode(7,OUTPUT);
  digitalWrite(5,HIGH);
  digitalWrite(7,LOW);
  Serial.begin(9600);
  GPS.begin(9600);

  
  dht.begin();
}

void loop() {
  
  SensorBundle sensorBundle;
  bool retVal = false;
    // Wait a few seconds between measurements.
  getGpsData();
  // Update the location parameters to be sent
  sensorBundle.latitude = nmea[2];
  sensorBundle.hemisphereLat = nmea[3];
  sensorBundle.longitude = nmea[4];
  sensorBundle.hemisphereLong = nmea[5];
  
  // Get the Temperature and Humidity data from the sensor
  getTempData(&sensorBundle.temperature, &sensorBundle.humidity);
  // Get the reading of the carbon monoxide sensor 
  sensorBundle.carbonMonoxideSenVal = getCarbonMonData();
  
  // Send all the data to Raspi for further processing.
  sendDataRasPi(&sensorBundle);

  
  delay(1500);

  
}


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
  sensorBundle->hemisphereLat = "E";
  String tempString = "\"" +sensorBundle->latitude + " " + sensorBundle->hemisphereLat+ "\"";
  Serial.print(tempString);
  Serial.print(",");

//  Serial.println(sensorBundle->hemisphereLat);
  Serial.print("\"long\":");
  sensorBundle->hemisphereLong = "N";
  tempString = "\"" + sensorBundle->longitude + " " +sensorBundle->hemisphereLong + "\"";
  Serial.print(tempString);
  
  Serial.println("}");
  //Serial.println(sensorBundle->hemisphereLong);
  //Serial.println("END");

}

int getCarbonMonData()
{
  // int avgCarbonMon = 0;
  
  // for(char i=0;i<10;i++)
  // {
  //   avgCarbonMon += analogRead(ADCREAD_CARBONMONOXIDE);
  //   delay(10);
  // }
  //return (avgCarbonMon/10);
  return analogRead(ADCREAD_CARBONMONOXIDE);
}

// Read and update the temperature and humidity data.

void getTempData(float *temp, float *humidity)
{
  *humidity = dht.readHumidity();
  *temp = dht.readTemperature();
}

bool getGpsData()
{
  GPS.flush();
  while (GPS.available() > 0)
  {
    GPS.read();

  }
  
  // To get to know the number of satellites in view
  if(GPS.find("$GPGSV"))
  {
    String temp = GPS.readStringUntil('\n');
    Serial.print("[DEBUG]:"); 
    Serial.println(temp);
  }
  
  if (GPS.find("$GPRMC,")) {
    String temp = GPS.readStringUntil('\n');
    for (int i = 0; i < temp.length(); i++) {
      if (temp.substring(i, i + 1) == ",") {
        nmea[pos] = temp.substring(stringplace, i);
        stringplace = i + 1;
        pos++;
      }
      if (i == temp.length() - 1) {
        nmea[pos] = temp.substring(stringplace, i);
      }
    }
    nmea[2] = ConvertLat();
    nmea[4] = ConvertLng();
    for (int i = 0; i < 9; i++) {
      //Serial.print(labels[i]);
      //Serial.print(nmea[i]);
      //Serial.println("");
    }
    stringplace = 0;
    pos = 0;
    return true;
  
  }
  return false;

}

String ConvertLat() {
  String posneg = "";
  if (nmea[3] == "S") {
    posneg = "-";
  }
  String latfirst;
  float latsecond;
  for (int i = 0; i < nmea[2].length(); i++) {
    if (nmea[2].substring(i, i + 1) == ".") {
      latfirst = nmea[2].substring(0, i - 2);
      latsecond = nmea[2].substring(i - 2).toFloat();
    }
  }
  latsecond = latsecond / 60;
  String CalcLat = "";

  char charVal[9];
  dtostrf(latsecond, 4, 6, charVal);
  for (int i = 0; i < sizeof(charVal); i++)
  {
    CalcLat += charVal[i];
  }
  latfirst += CalcLat.substring(1);
  latfirst = posneg += latfirst;
  return latfirst;
}

String ConvertLng() {
  String posneg = "";
  if (nmea[5] == "W") {
    posneg = "-";
  }

  String lngfirst;
  float lngsecond;
  for (int i = 0; i < nmea[4].length(); i++) {
    if (nmea[4].substring(i, i + 1) == ".") {
      lngfirst = nmea[4].substring(0, i - 2);
      //Serial.println(lngfirst);
      lngsecond = nmea[4].substring(i - 2).toFloat();
      //Serial.println(lngsecond);

    }
  }
  lngsecond = lngsecond / 60;
  String CalcLng = "";
  char charVal[9];
  dtostrf(lngsecond, 4, 6, charVal);
  for (int i = 0; i < sizeof(charVal); i++)
  {
    CalcLng += charVal[i];
  }
  lngfirst += CalcLng.substring(1);
  lngfirst = posneg += lngfirst;
  return lngfirst;
}




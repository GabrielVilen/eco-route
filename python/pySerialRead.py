# This script reads the serial data from Arduino and parses it

import serial # Read data seriall from Arduino
import json	# To parse the input read from Arduino and to send data to the cloud

# TODO: find the port which Arduino is connected automatically
usbPort = '/dev/ttyACM2'

serHandler = serial.Serial(usbPort,9600)


# This function checks if the raw_data is actuall a json, and returns a handler to the json if it is
def getJsonHandler(raw_data):
	try:
		jsonData = json.loads(raw_data)
		return (jsonData,True)
	except ValueError as e:
		print (serData)
		return (None,False)
	

while(True):
	# Arduino will be sending the data in JSON format
	serData = serHandler.readline()
	(jsonData,isjson) = getJsonHandler(serData)
	if(isjson):
		print(jsonData)

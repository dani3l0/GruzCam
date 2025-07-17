import time
import json
from datetime import datetime

# Read raw Torque csv log file
rawCsv = open("trackLog.csv", "r").read().lower()
print(f"Read {len(rawCsv.split("\n"))} lines")

# Data object
data = []

# L00p through lines
currentHeader = []
currentRow = []

# Finds value from csv line
def findValue(columnName):
	global currentHeader, currentRow
	try:
		for x in currentHeader:
			if columnName in x:
				index = currentHeader.index(x)
				value = currentRow[index]
				if value.replace(".", "").replace("-", "").isdecimal():
					value = float(value)
				return value
	except:
		pass
	return False

# Extract records
firstTimestamp = False
for line in rawCsv.split("\n"):
	params = line.split(",")
	if params[0].startswith("device time"):
		currentHeader = params
		continue
	currentRow = params
	entry = {
		"timestamp": findValue("device time"),
		"temperature": findValue("coolant temperature"),
		"load": findValue("engine load"),
		"rpm": findValue("engine rpm"),
		"fuel_used": findValue("fuel used"),
		"speed": findValue("speed"),
		"throttle": findValue("throttle"),
		"voltage": findValue("voltage"),
		"boost": findValue("turbo boost"),
	}
	if not len(entry["timestamp"]):
		continue
	parsed = datetime.strptime(entry["timestamp"], "%d-%b-%Y %H:%M:%S.%f")
	entry["timestamp"] = parsed.timestamp()
	data.append(entry)
	print(entry)

# Save parsed data to web-friendly JSON
with open("trackLog.json", "w") as f:
	f.write(json.dumps(data, indent=4))
	f.close()
	print("'trackLog.csv' has been converted to 'trackLog.json' successfully.")

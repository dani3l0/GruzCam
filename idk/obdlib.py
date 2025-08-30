import obd
import time
import os
import asyncio
import traceback
import random

# Empty data maker
def mkemptydata():
	return {
		"speed": 0,
		"load": 0,
		"coolant": 0,
		"rpm": 0,
		"throttle": 0,
		"voltage": 0,
	}

# OBD data object
data = mkemptydata()

# Polling function
async def polling():
	global data
	while True:
		print("Trying to connect to Bluetooth OBD adapter")
		os.system("rfcomm bind rfcomm0 00:0D:18:3A:67:89")
		print("Available devices:", ", ".join(obd.scan_serial()))

		connection = obd.OBD(portstr="/dev/rfcomm0", fast=True, check_voltage=False)
		try:
			while connection.status() == obd.OBDStatus.ELM_CONNECTED:
				data["speed"] = connection.query(obd.commands.SPEED)
				data["load"] = connection.query(obd.commands.ENGINE_LOAD)
				data["coolant"] = connection.query(obd.commands.COOLANT_TEMP)
				data["rpm"] = connection.query(obd.commands.RPM)
				data["throttle"] = connection.query(obd.commands.THROTTLE_POS)
				data["voltage"] = connection.query(obd.commands.CONTROL_MODULE_VOLTAGE)
		except Exception as e:
			data = mkemptydata()
			print(f"Polling process crashed due to connection problems. [{e}]")
			print(traceback.format_exc())

		await asyncio.sleep(2)
		os.system("rfcomm release rfcomm0")
		await asyncio.sleep(3)

# Fake polling, for testing
async def fake_polling():
	global data
	while True:
		data["speed"] = random.randint(700, 750) / 10
		data["load"] = random.randint(230, 300) / 10
		data["coolant"] = random.randint(750, 780) / 10
		data["rpm"] = random.randint(1700, 1750)
		data["throttle"] = random.randint(250, 500) / 10
		data["voltage"] = random.randint(129, 131) / 10
		await asyncio.sleep(0.35)

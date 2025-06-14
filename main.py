import asyncio
import websockets
import obdlib
import json
from websockets.asyncio.server import serve

async def echo(websocket):
	try:
		while True:
			lastdata = obdlib.data.copy()
			await asyncio.sleep(0.1)
			if lastdata != obdlib.data:
				await websocket.send(json.dumps(obdlib.data))
	except websockets.ConnectionClosedError:
		pass

async def main():
	server = await serve(echo, "localhost", 8765)
	# asyncio.gather(obdlib.polling())
	asyncio.gather(obdlib.fake_polling())
	print("Server is running... I guess")
	await server.serve_forever()
	

asyncio.run(main())

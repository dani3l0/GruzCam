import render, { GAUGES } from './gauges'
import './style.css'

// Start rendering gauges

// Live reading mode
var ws = new WebSocket("ws://localhost:8765")
ws.onopen = function() {
	render('#gauges')
}
ws.onmessage = function(msg) {
	let data = JSON.parse(msg.data)
	// console.log(data)

	GAUGES.throttle.value = data.throttle
	GAUGES.load.value = data.load
	GAUGES.tachometer.value = data.rpm
	GAUGES.speedometer.value = data.speed
	GAUGES.coolant.value = data.coolant
	GAUGES.battery.value = data.battery
}

// Alt mode
window.obdata = []
window.avgref = 3000
ws.onerror = async function() {
	let resp = await fetch("trackLog.json")
	let contents = await resp.json()
	window.obdata = contents
	console.log("Websockets unavailable, running alt mode")
	let refs = []
	for (let i = 1; i < contents.length; i++) {
		let elem = contents[i]
		let lastElem = contents[i-1]
		let diff = Math.abs(elem.timestamp - lastElem.timestamp)
		if (diff < 5) {
			refs.push(diff*1000)
		}
	}
	window.avgref = refs.reduce((a, b) => a + b) / refs.length
	console.log("Computed average OBD response time: ", window.avgref, "ms")
	render('#gauges')
	document.querySelector("#offset").value = parseInt(contents[0].timestamp, 10)
	// document.querySelector("#offset").value = 1752489984
	let preview = () => {
		document.querySelector("#offsetPreview").innerHTML = String(new Date(1000*parseInt(document.querySelector("#offset").value, 10)).toString())
	}
	document.querySelector("#offset").addEventListener("input", preview)
	document.querySelector("#offSetter").addEventListener("click", replay)
	preview()
	setTimeout(replay, window.avgref * 3)
}

// Gets reading closest to provided timestamp
window.getReadingAt = (timestamp) => {
	let closestDiff = 9999
	let closestReading = window.obdata[0]
	for (let reading of window.obdata) {
		let diff = Math.abs(reading["timestamp"] - timestamp)
		if (diff < closestDiff) {
			closestDiff = diff
			closestReading = reading
		}
	}
	console.log(closestReading)
	return closestReading
}

// Sets gauge values from OBD data, selects reading closest to provided timestamp
window.setGauges = (reading) => {
	GAUGES.throttle.value = reading.throttle
	GAUGES.load.value = reading.load
	GAUGES.tachometer.value = reading.rpm
	GAUGES.speedometer.value = reading.speed
	GAUGES.coolant.value = reading.temperature
	GAUGES.battery.value = reading.voltage
}

// Maintains and updates live-recorded data
window.updater = null
function replay() {
	let time = 200
	clearInterval(window.updater)
	let ts = parseInt(document.querySelector("#offset").value, 10)
	let ts_now = ts
	let ts_last = 0
	window.updater = setInterval(() => {
		let entry = getReadingAt(ts_now)
		if (entry.timestamp > ts_last) {
			// document.querySelector("#timestamp").innerHTML = ts_now
			// document.querySelector("#timestamp-nice").innerHTML = new Date(ts_now*1000).toString()
			window.setGauges(entry)
		}
		ts_last = Math.ceil(entry.timestamp)
		ts_now += time/1000
	}, time)
}

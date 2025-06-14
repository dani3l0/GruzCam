import render, { GAUGES } from './gauges'
import './style.css'

render('#gauges')

var ws = new WebSocket("ws://localhost:8765")

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

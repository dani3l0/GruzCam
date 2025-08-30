import './style.css'

let DISTANCE = 0
let DISTANCE_UPDT = new Date().getTime()
let ZRRO = {
	temperature: 40,
	rpm: 0,
	speed: 0,
	load: 0,
}

function calcDistance(speed) {
	let now = new Date().getTime()
	let diff = now - DISTANCE_UPDT
	let diffSeconds = diff / 1000
	let metersPerHour = speed * 1000
	let metersPerMinute = metersPerHour / 60
	let metersPerSecond = metersPerMinute / 60
	let metersDone = metersPerSecond * diffSeconds
	DISTANCE += metersDone
	DISTANCE_UPDT = now
}

function set(id, value, min, max, degs) {
	if (isNaN(value)) return
	if (value < min) value = min
	let pp = (value - min) / (max - min)
	let v = degs * pp
	document.getElementById(id).setAttribute("style", `--value: ${v}deg`)
}
function setValue(id, value, float) {
	if (!float) value = Math.round(value)
	document.getElementById(id).setAttribute("style", `--num: ${value}`)
}

// Alt mode
window.obdata = []
window.avgref = 3000
async function load() {
	let resp = await fetch("trackLog.json")
	let contents = await resp.json()
	window.obdata = contents
	let refs = []
	for (let i = 1; i < contents.length; i++) {
		let elem = contents[i]
		let lastElem = contents[i-1]
		let diff = Math.abs(elem.timestamp - lastElem.timestamp)
		if (diff < 5) {
			refs.push(diff*1000)
		}
	}
	window.avgref = refs.reduce((a, b) => a + b) / Math.round(refs.length / 2)
	console.log("Computed average OBD response time: ", window.avgref, "ms")
	document.querySelector("#offset").value = parseInt(contents[0].timestamp, 10)
	let preview = () => {
		document.querySelector("#offsetPreview").innerHTML = String(new Date(1000*parseInt(document.querySelector("#offset").value, 10)).toString())
	}
	document.querySelector("#offset").addEventListener("input", preview)
	document.querySelector("#offSetter").addEventListener("click", replay)
	document.querySelector("#stopper").addEventListener("click", () => {
		clearInterval(window.updater)
		setGauges(ZRRO)
	})
	setGauges(ZRRO)
	preview()
}

window.addEventListener("load", load)

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
window.setGauges = (data) => {
	set("coolant-needle", data.temperature, 40, 125, 225)
	set("tacho-needle", data.rpm, 0, 6000, 260)
	setValue("tacho-rpm", data.rpm)
	setValue("tacho-load", data.load)
	set("speedo-needle", data.speed, 0, 160, 260)
	setValue("speedo-speed", data.speed)
	setValue("speedo-trip", DISTANCE)
	set("load-needle", data.load, 0, 100, 225)
}

// Maintains and updates live-recorded data
window.updater = null
async function replay() {
	document.body.setAttribute("style", `--duration: 1250ms`)
	await new Promise(e => setTimeout(e, 1500))
	setGauges({
		temperature: 125,
		rpm: 6000,
		speed: 160,
		load: 100,
	})

	await new Promise(e => setTimeout(e, 1500))
	setGauges(ZRRO)
	await new Promise(e => setTimeout(e, 1500))
	document.body.setAttribute("style", `--duration: ${Math.ceil(window.avgref)}ms`)
	let time = 200
	clearInterval(window.updater)
	let ts = parseInt(document.querySelector("#offset").value, 10)
	let ts_now = ts
	let ts_last = 0
	let up = () => {
		let entry = getReadingAt(ts_now)
		if (entry.timestamp > ts_last) {
			document.querySelector("#timestamp").innerHTML = ts_now
			document.querySelector("#timestamp-nice").innerHTML = new Date(ts_now*1000).toString()
			window.setGauges(entry)
			calcDistance(entry.speed)
		}
		ts_last = Math.ceil(entry.timestamp)
		ts_now += time/1000
	}
	up()
	window.updater = setInterval(up, time)
}
